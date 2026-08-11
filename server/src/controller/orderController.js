import Order from "../models/Order.js";
import Restaurant from "../models/Restaurants.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { generateOrderId } from "../utils/orderUtils.js";
import { sendWebPushNotification } from "../utils/pushNotification.js";

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";


/**
 * Helper to strip personal contact information before sending order data to riders
 */
const sanitizeOrderForRider = (orderDoc) => {
  if (!orderDoc) return null;
  const orderObj = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
  delete orderObj.contactNumber;
  delete orderObj.studentPhone;
  if (orderObj.student && typeof orderObj.student === 'object' && !orderObj.student._bsontype) {
    delete orderObj.student.phone;
    delete orderObj.student.email;
  }
  return orderObj;
};

/**
 * Helper to find an order by Mongoose _id or custom orderId
 */
const findOrderByIdOrCustomId = async (idParam) => {
  if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
    let order = await Order.findById(idParam).catch(() => null);
    if (order) return order;
  }
  return await Order.findOne({ orderId: idParam });
};

/**
 * Helper to get vendor owner ID from restaurant
 */
const getVendorId = async (restaurantId) => {
  const rest = await Restaurant.findById(restaurantId);
  return rest?.owner?.toString() || null;
};

/**
 * POST /api/orders
 * Creates a new order with auto-generated orderId in format: ODR-[Random 5 Digits]-[Vendor Initials]
 */
export const createOrder = async (req, res) => {
  try {
    const { restaurantId, restaurant: altRestaurantId, items, totalAmount, studentPhone, contactNumber, deliveryLocation, deliveryDestination } = req.body;
    const targetRestaurantId = restaurantId || altRestaurantId;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No order items provided" });
    }

    const restaurant = await Restaurant.findById(targetRestaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }
    if (!restaurant.isActive) {
      return res.status(400).json({ success: false, message: "Restaurant is currently closed" });
    }

    const finalContact = contactNumber || studentPhone || "N/A";
    const location = deliveryLocation || deliveryDestination || "University Main Gate";
    const customId = generateOrderId(restaurant.name);

    const order = await Order.create({
      orderId: customId,
      student: req.user._id,
      contactNumber: finalContact,
      studentPhone: finalContact,
      restaurant: restaurant._id,
      items,
      totalAmount,
      deliveryLocation: location,
      status: "pending"
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("student", "name registeration_number")
      .populate("restaurant", "name phone coverImage");

    // Emit real-time socket event to vendor room
    const io = req.app.get("socketio");
    if (io) {
      io.to(restaurant.owner.toString()).emit("new_vendor_order", populatedOrder);
      const vendorNotif = await Notification.create({
        recipient: restaurant.owner,
        type: "CANTEEN",
        onModel: "Order",
        relatedItem: order._id,
        message: `New order #${order.orderId} received from ${req.user?.name || "a student"}! 🍔`
      });
      io.to(restaurant.owner.toString()).emit("new_notification", vendorNotif);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({ success: false, message: "Error creating order", error: safeError(error) });
  }
};

/**
 * PUT /api/orders/:id/accept-rider
 * Rider accepts the ticket.
 * - Checks rider doesn't already have an active order
 * - Assigns rider to order, keeps status as "accepted" (vendor controls "preparing")
 * - Removes ticket from global pool
 */
export const acceptRiderTicket = async (req, res) => {
  try {
    // ── Guard: Check if this rider already has an active order ────────────────
    // Do this BEFORE the atomic claim to give a helpful error message
    const activeOrder = await Order.findOne({
      rider: req.user._id,
      status: { $nin: ["completed", "cancelled"] }
    });

    // Re-check after claiming — but pre-check provides better UX error
    if (activeOrder) {
      return res.status(400).json({
        success: false,
        message: `You already have an active delivery (Order ${activeOrder.orderId}). Complete it before accepting a new one.`
      });
    }

    // ── ATOMIC CLAIM — Prevents Race Condition ────────────────────────────────
    // findOneAndUpdate with { rider: null } condition means:
    //   "Only update this document if rider is STILL null at the moment of write"
    // MongoDB processes this as a single atomic operation.
    // If two riders fire simultaneously, only ONE write will succeed.
    // The other will get null back (document was already claimed).
    const order = await Order.findOneAndUpdate(
      {
        // Match: order ID, unclaimed, and still in ticket pool
        $or: [
          { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
          { orderId: req.params.id }
        ],
        rider: null,                              // ← ATOMIC: only if unclaimed
        status: { $in: ["accepted", "ready"] }    // ← only if ticket is available
      },
      {
        $set: { rider: req.user._id }             // ← atomically assign this rider
      },
      {
        new: true,                                // return updated document
        runValidators: true
      }
    );

    // If null: ticket was already claimed by another rider or doesn't exist
    if (!order) {
      // Find out WHY — give a specific error message
      const existing = await findOrderByIdOrCustomId(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Order not found." });
      }
      if (!["accepted", "ready"].includes(existing.status)) {
        return res.status(400).json({ success: false, message: `This ticket is not available. Order status: '${existing.status}'` });
      }
      if (existing.rider && existing.rider.toString() === req.user._id.toString()) {
        // Rider is re-claiming their own ticket — idempotent OK
        const sanitizedOrder = sanitizeOrderForRider(existing);
        return res.status(200).json({ success: true, message: "You have already claimed this ticket.", order: sanitizedOrder });
      }
      // Another rider beat them to it
      return res.status(409).json({
        success: false,
        message: "This ticket has already been claimed by another rider. Better luck next time! 🏎️"
      });
    }

    // ── Success — Emit Socket Events ─────────────────────────────────────────
    const io = req.app.get("socketio");
    if (io) {
      // Broadcast ticket removal to ALL riders (removes from their lists)
      io.to("riders").emit("ticket_accepted", { orderId: order.orderId });
      // Notify the student
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: order.status,
        riderName: req.user?.name || "Rider",
        message: `A rider (${req.user?.name || "Rider"}) has accepted your delivery! 🛵`
      });
      // Notify vendor
      const vendorId = await getVendorId(order.restaurant);
      if (vendorId) {
        io.to(vendorId).emit("rider_accepted_order", {
          orderId: order.orderId,
          riderName: req.user?.name || "Rider"
        });
      }
    }

    const notif = await Notification.create({
      recipient: order.student,
      type: "CANTEEN",
      onModel: "Order",
      relatedItem: order._id,
      message: `Rider ${req.user?.name || "A rider"} has accepted your order ${order.orderId} and is on the way!`
    });
    if (io) {
      io.to(order.student.toString()).emit("new_notification", notif);
    }

    const sanitizedOrder = sanitizeOrderForRider(order);
    return res.status(200).json({
      success: true,
      message: "Ticket accepted successfully! You are now the assigned rider.",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in acceptRiderTicket:", error);
    return res.status(500).json({ success: false, message: "Error accepting ticket", error: safeError(error) });

  }
};

/**
 * PUT /api/orders/:id/pickup
 * Rider picks up the order from the restaurant. Changes status to picked_up.
 * Student is notified "Your order is en route!"
 */
export const pickupOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Guard: Only the assigned rider can mark pickup
    if (!order.rider || order.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the assigned rider can mark this order as picked up." });
    }

    // Guard: Order must be in 'ready' state to pick up
    if (order.status !== "ready") {
      return res.status(400).json({ success: false, message: `Cannot pick up order in '${order.status}' state. Order must be 'ready'.` });
    }

    order.status = "picked_up";
    await order.save();

    const io = req.app.get("socketio");
    if (io) {
      // Notify student
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "picked_up",
        message: "🛵 Your order has been picked up and is en route to you!"
      });
      // Notify vendor
      const vendorId = await getVendorId(order.restaurant);
      if (vendorId) {
        io.to(vendorId).emit("order_status_update", {
          orderId: order.orderId,
          status: "picked_up"
        });
      }
    }

    const notif = await Notification.create({
      recipient: order.student,
      type: "CANTEEN",
      onModel: "Order",
      relatedItem: order._id,
      message: `Your order ${order.orderId} has been picked up! The rider is on the way to you. 🛵`
    });
    if (io) {
      io.to(order.student.toString()).emit("new_notification", notif);
    }

    // Web Push fallback — fires if the student's tab is closed / no socket connection
    User.findById(order.student).select("pushSubscription").then((student) => {
      if (student?.pushSubscription) {
        sendWebPushNotification(student.pushSubscription, {
          title: "CampusConnect 🛵",
          body: `Your order ${order.orderId} has been picked up and is on the way!`,
          url: "/canteen/orders"
        });
      }
    }).catch(() => {});

    const sanitizedOrder = sanitizeOrderForRider(order);
    return res.status(200).json({
      success: true,
      message: "Order marked as picked up — en route to student!",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in pickupOrder:", error);
    return res.status(500).json({ success: false, message: "Error marking pickup", error: safeError(error) });
  }
};

/**
 * PUT /api/orders/:id/arrive
 * Rider clicks "Arrived". Changes status to arrived & sends direct Socket ping to student dashboard.
 * Guard: Order must be in 'picked_up' state.
 */
export const arriveOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Guard: Only the assigned rider
    if (!order.rider || order.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the assigned rider can mark arrival." });
    }

    // Guard: Must be picked_up first
    if (order.status !== "picked_up") {
      return res.status(400).json({ success: false, message: `Cannot mark arrival. Order must be 'picked_up' first. Current: '${order.status}'` });
    }

    order.status = "arrived";
    await order.save();

    const io = req.app.get("socketio");
    if (io) {
      // Direct ping to student
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "arrived",
        message: "📍 Your delivery rider has arrived at the delivery point! Please come collect your order."
      });
      // Notify vendor
      const vendorId = await getVendorId(order.restaurant);
      if (vendorId) {
        io.to(vendorId).emit("order_status_update", {
          orderId: order.orderId,
          status: "arrived"
        });
      }
    }

    const notif = await Notification.create({
      recipient: order.student,
      type: "CANTEEN",
      onModel: "Order",
      relatedItem: order._id,
      message: `📍 Rider has arrived with order ${order.orderId}! Please meet them at ${order.deliveryLocation}.`
    });
    if (io) {
      io.to(order.student.toString()).emit("new_notification", notif);
      io.to(order.student.toString()).emit("order_arrived", {
        orderId: order.orderId,
        message: `📍 Rider has arrived with order ${order.orderId} at ${order.deliveryLocation}!`
      });
    }

    // Web Push fallback — most urgent event; student MUST be notified even if tab is closed
    User.findById(order.student).select("pushSubscription").then((student) => {
      if (student?.pushSubscription) {
        sendWebPushNotification(student.pushSubscription, {
          title: "📍 Rider Arrived! — CampusConnect",
          body: `Your rider is at ${order.deliveryLocation}. Please come collect order ${order.orderId}!`,
          url: "/canteen/orders"
        });
      }
    }).catch(() => {});

    const sanitizedOrder = sanitizeOrderForRider(order);
    return res.status(200).json({
      success: true,
      message: "Arrival notification sent to student",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in arriveOrder:", error);
    return res.status(500).json({ success: false, message: "Error updating arrival status", error: safeError(error) });
  }
};

/**
 * PUT /api/orders/:id/complete
 * Rider marks order as delivered. Guard: Order must be 'arrived'.
 */
export const completeOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Guard: Only assigned rider
    if (!order.rider || order.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the assigned rider can complete this order." });
    }

    // Idempotent guard: if already completed, return success
    if (order.status === "completed") {
      return res.status(200).json({ success: true, message: "Order was already completed.", order: sanitizeOrderForRider(order) });
    }

    // Guard: Must arrive first
    if (order.status !== "arrived") {
      return res.status(400).json({ success: false, message: `Cannot complete order. Must mark 'arrived' first. Current: '${order.status}'` });
    }

    order.status = "completed";
    await order.save();

    const io = req.app.get("socketio");
    if (io) {
      // Notify student
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "completed",
        message: "🎉 Your order has been delivered! Enjoy your meal."
      });
      // Notify rider — clears their active delivery panel
      io.to(req.user._id.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "completed"
      });
      // Notify vendor
      const vendorId = await getVendorId(order.restaurant);
      if (vendorId) {
        io.to(vendorId).emit("order_completed_by_rider", {
          orderId: order.orderId,
          status: "completed",
          riderName: req.user?.name || "Rider"
        });
      }
    }

    const notif = await Notification.create({
      recipient: order.student,
      type: "CANTEEN",
      onModel: "Order",
      relatedItem: order._id,
      message: `🎉 Order ${order.orderId} has been delivered! Enjoy your meal. Please rate your experience.`
    });
    if (io) {
      io.to(order.student.toString()).emit("new_notification", notif);
      io.to(order.student.toString()).emit("order_delivered", {
        orderId: order.orderId,
        message: `🎉 Order ${order.orderId} delivered!`
      });
    }

    // Web Push fallback — notifies student the order is complete even if tab was closed
    User.findById(order.student).select("pushSubscription").then((student) => {
      if (student?.pushSubscription) {
        sendWebPushNotification(student.pushSubscription, {
          title: "🎉 Order Delivered! — CampusConnect",
          body: `Order ${order.orderId} has been delivered. Enjoy your meal!`,
          url: "/canteen/orders"
        });
      }
    }).catch(() => {});

    const sanitizedOrder = sanitizeOrderForRider(order);
    return res.status(200).json({
      success: true,
      message: "Order successfully completed",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in completeOrder:", error);
    return res.status(500).json({ success: false, message: "Error completing order", error: safeError(error) });
  }
};

/**
 * POST /api/orders/:id/nudge
 * Student nudges vendor for update. Rate-limited.
 * Only available if order is in pending/accepted/preparing stages.
 */
export const nudgeOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only meaningful in early stages
    const nudgeableStatuses = ["pending", "accepted", "preparing"];
    if (!nudgeableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Nudge not applicable at this stage (${order.status}). Your order is already being handled.`
      });
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Associated restaurant not found" });
    }

    const io = req.app.get("socketio");
    if (io) {
      io.to(restaurant.owner.toString()).emit("order_nudge", {
        orderId: order.orderId,
        message: `🔔 Nudge from student! Order ${order.orderId} — student is asking for an update.`,
        timestamp: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Nudge sent successfully to vendor for order ${order.orderId}`
    });
  } catch (error) {
    console.error("Error in nudgeOrder:", error);
    return res.status(500).json({ success: false, message: "Error sending nudge", error: safeError(error) });
  }
};

/**
 * POST /api/orders/:id/nudge-rider
 * Student pings rider that they are heading to the meetup point.
 * Only available when order status is 'arrived'.
 */
export const nudgeRiderOnArrival = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status !== "arrived" && order.status !== "picked_up") {
      return res.status(400).json({
        success: false,
        message: `Arrival nudge is available when rider has arrived or picked up order. Current status: '${order.status}'`
      });
    }

    const io = req.app.get("socketio");
    if (io) {
      const payload = {
        orderId: order.orderId,
        message: `🏃‍♂️ Student is heading to collect Order ${order.orderId} — they're on their way!`,
        timestamp: new Date()
      };

      if (order.rider) {
        const riderIdStr = order.rider._id ? order.rider._id.toString() : order.rider.toString();
        io.to(riderIdStr).emit("student_nudge_arrival", payload);
      }
      // Broadcast to riders room as failsafe
      io.to("riders").emit("student_nudge_arrival", payload);
    }

    return res.status(200).json({
      success: true,
      message: `Arrival nudge sent to rider for order ${order.orderId}`
    });
  } catch (error) {
    console.error("Error in nudgeRiderOnArrival:", error);
    return res.status(500).json({ success: false, message: "Error sending arrival nudge", error: safeError(error) });
  }
};

/**
 * GET /api/orders/marketplace/my-active
 * Fetch currently claimed active order for the logged-in rider.
 */
export const getRiderActiveOrder = async (req, res) => {
  try {
    const activeOrder = await Order.findOne({
      rider: req.user._id,
      status: { $in: ["accepted", "preparing", "ready", "picked_up", "arrived"] }
    }).populate('restaurant', 'name phone coverImage address');

    if (!activeOrder) {
      return res.status(200).json({ success: true, activeOrder: null });
    }

    return res.status(200).json({
      success: true,
      activeOrder: {
        _id: activeOrder._id,
        orderId: activeOrder.orderId,
        status: activeOrder.status,
        totalAmount: activeOrder.totalAmount,
        deliveryLocation: activeOrder.deliveryLocation,
        contactNumber: activeOrder.contactNumber,
        studentPhone: activeOrder.studentPhone,
        restaurantName: activeOrder.restaurant?.name || "Campus Canteen",
        restaurantPhone: activeOrder.restaurant?.phone || "+923001234567",
        items: activeOrder.items || []
      }
    });
  } catch (error) {
    console.error("Error fetching rider active order:", error);
    return res.status(500).json({ success: false, message: "Error fetching active order", error: safeError(error) });
  }
};

/**
 * GET /api/orders/rider/history
 * Fetch completed delivery history for the logged-in rider.
 */
export const getRiderHistory = async (req, res) => {
  try {
    const history = await Order.find({
      rider: req.user._id,
      status: "completed"
    })
      .populate("restaurant", "name phone")
      .sort({ updatedAt: -1 });

    const formattedHistory = history.map(o => ({
      _id: o._id,
      orderId: o.orderId,
      totalAmount: o.totalAmount,
      deliveryLocation: o.deliveryLocation,
      restaurantName: o.restaurant?.name || "Campus Canteen",
      completedAt: new Date(o.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: o.createdAt
    }));

    return res.status(200).json({ success: true, count: formattedHistory.length, history: formattedHistory });
  } catch (error) {
    console.error("Error fetching rider history:", error);
    return res.status(500).json({ success: false, message: "Error fetching rider history", error: safeError(error) });
  }
};

/**
 * GET /api/orders/marketplace/tickets
 * Riders browse available tickets: orders in 'accepted' or 'ready' status with no rider assigned.
 * Enforces RBAC & Restaurant Data Segregation.
 */
export const getMarketplaceTickets = async (req, res) => {
  try {
    const query = {
      status: { $in: ["accepted", "preparing", "ready"] },
      rider: null
    };

    // Global Marketplace: Riders see all available tickets across the campus.

    const tickets = await Order.find(query)
      .select("orderId deliveryLocation totalAmount createdAt status")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    const formattedTickets = tickets.map(t => ({
      orderId: t.orderId,
      deliveryDestination: t.deliveryLocation,
      totalAmount: t.totalAmount,
      restaurantName: t.restaurant?.name || "Campus Canteen",
      status: t.status,
      urgent: t.status === "ready",
      createdAt: t.createdAt
    }));

    return res.status(200).json({ success: true, count: formattedTickets.length, tickets: formattedTickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching marketplace tickets", error: safeError(error) });
  }
};

/**
 * GET /api/orders/:id
 * Get single order details
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (req.user && req.user.role === "rider") {
      return res.status(200).json({ success: true, order: sanitizeOrderForRider(order) });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching order", error: safeError(error) });
  }
};

/**
 * PUT /api/orders/:id/cancel
 * POST /api/orders/:id/cancel
 * Cancel an order at any active step (pending, accepted, preparing, ready, picked_up, arrived)
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["completed", "cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Order is already '${order.status}' and cannot be cancelled.` });
    }

    const { reason, cancellationReason } = req.body;
    const finalReason = cancellationReason || reason || "Order cancelled";

    const restaurant = await Restaurant.findById(order.restaurant);
    const restaurantName = restaurant?.name || "Campus Canteen";

    order.status = "cancelled";
    await order.save();

    const io = req.app.get("socketio");
    if (io) {
      // Notify Student
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "cancelled",
        reason: finalReason,
        message: `We're sorry — your order from ${restaurantName} has been cancelled.${finalReason ? ` Reason: ${finalReason}` : ""}`
      });

      // Notify Rider if assigned
      if (order.rider) {
        const riderIdStr = order.rider._id ? order.rider._id.toString() : order.rider.toString();
        io.to(riderIdStr).emit("order_status_update", {
          orderId: order.orderId,
          status: "cancelled",
          reason: finalReason,
          message: `Order ${order.orderId} from ${restaurantName} was cancelled.${finalReason ? ` Reason: ${finalReason}` : ""}`
        });
        io.to(riderIdStr).emit("ticket_cancelled", { orderId: order.orderId });
      }

      // Broadcast to all riders to remove ticket from open marketplace pool
      io.to("riders").emit("ticket_cancelled", { orderId: order.orderId });

      // Notify vendor
      if (restaurant?.owner) {
        io.to(restaurant.owner.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "cancelled"
        });
      }
    }

    // In-app DB Notification for Student
    const studentNotif = await Notification.create({
      recipient: order.student,
      type: "CANTEEN",
      onModel: "Order",
      relatedItem: order._id,
      message: `Your order ${order.orderId} from ${restaurantName} has been cancelled.${finalReason ? ` Reason: ${finalReason}` : " We apologize for the inconvenience."}`
    });
    if (io) {
      io.to(order.student.toString()).emit("new_notification", studentNotif);
    }

    // In-app DB Notification for Rider if assigned
    if (order.rider) {
      const riderNotif = await Notification.create({
        recipient: order.rider,
        type: "CANTEEN",
        onModel: "Order",
        relatedItem: order._id,
        message: `Order ${order.orderId} from ${restaurantName} was cancelled.${finalReason ? ` Reason: ${finalReason}` : ""}`
      });
      if (io) {
        io.to(order.rider.toString()).emit("new_notification", riderNotif);
      }
    }

    // Web Push fallback for Student
    User.findById(order.student).select("pushSubscription").then((studentDoc) => {
      if (studentDoc?.pushSubscription) {
        sendWebPushNotification(studentDoc.pushSubscription, {
          title: "❌ Order Cancelled — CampusConnect",
          body: `Your order ${order.orderId} from ${restaurantName} was cancelled.${finalReason ? ` Reason: ${finalReason}` : ""}`,
          url: "/canteen"
        });
      }
    }).catch(() => {});

    // Web Push fallback for Rider
    if (order.rider) {
      User.findById(order.rider).select("pushSubscription").then((riderDoc) => {
        if (riderDoc?.pushSubscription) {
          sendWebPushNotification(riderDoc.pushSubscription, {
            title: "❌ Delivery Cancelled — CampusConnect",
            body: `Order ${order.orderId} from ${restaurantName} was cancelled.`,
            url: "/rider/dashboard"
          });
        }
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    return res.status(500).json({ success: false, message: "Error cancelling order", error: safeError(error) });
  }
};
