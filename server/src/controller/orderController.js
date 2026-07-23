import Order from "../models/Order.js";
import Restaurant from "../models/Restaurants.js";
import Notification from "../models/Notification.js";
import { generateOrderId } from "../utils/orderUtils.js";

/**
 * Helper to strip personal contact information before sending order data to riders
 */
const sanitizeOrderForRider = (orderDoc) => {
  const orderObj = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
  delete orderObj.contactNumber;
  delete orderObj.studentPhone;
  if (orderObj.student && typeof orderObj.student === 'object') {
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
    let order = await Order.findById(idParam);
    if (order) return order;
  }
  return await Order.findOne({ orderId: idParam });
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

    // Determine contact number
    const finalContact = contactNumber || studentPhone || "N/A";
    const location = deliveryLocation || deliveryDestination || "University Main Gate";

    // Generate custom orderId
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
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: populatedOrder
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({ success: false, message: "Error creating order", error: error.message });
  }
};

/**
 * PUT /api/orders/:id/dispatch
 * Vendor generates ticket and dispatches order.
 * Emits Socket event to the 'riders' room containing ONLY orderId and deliveryDestination.
 */
export const dispatchOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "dispatched";
    await order.save();

    const destination = order.deliveryLocation || "University Main Gate";

    // Emit socket event to riders room with ONLY orderId and deliveryDestination
    const io = req.app.get("socketio");
    if (io) {
      io.to("riders").emit("new_ticket", {
        orderId: order.orderId,
        deliveryDestination: destination
      });
      // also notify student
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "dispatched"
      });
    }

    // Create Notification
    await Notification.create({
      recipient: order.student,
      type: "GENERAL",
      message: `Order ${order.orderId} dispatched! A delivery rider will pick it up soon.`
    });

    return res.status(200).json({
      success: true,
      message: "Order ticket generated and dispatched to riders marketplace",
      ticket: {
        orderId: order.orderId,
        deliveryDestination: destination,
        status: order.status
      }
    });
  } catch (error) {
    console.error("Error in dispatchOrder:", error);
    return res.status(500).json({ success: false, message: "Error dispatching order", error: error.message });
  }
};

/**
 * PUT /api/orders/:id/accept-rider
 * Rider accepts the ticket. Assigns rider ID to order and removes ticket from global pool.
 */
export const acceptRiderTicket = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.rider && order.rider.toString() !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Ticket already claimed by another rider" });
    }

    order.rider = req.user._id;
    order.status = "accepted";
    await order.save();

    // Emit Socket event to remove ticket from global riders pool
    const io = req.app.get("socketio");
    if (io) {
      io.to("riders").emit("ticket_accepted", { orderId: order.orderId });
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "accepted"
      });
    }

    // Zero-Trust: Return payload with contact info stripped
    const sanitizedOrder = sanitizeOrderForRider(order);

    return res.status(200).json({
      success: true,
      message: "Ticket accepted successfully",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in acceptRiderTicket:", error);
    return res.status(500).json({ success: false, message: "Error accepting ticket", error: error.message });
  }
};

/**
 * PUT /api/orders/:id/arrive
 * Rider clicks "Arrived". Changes status to arrived & sends direct Socket ping to student dashboard.
 */
export const arriveOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "arrived";
    await order.save();

    // Direct Socket notification to student dashboard
    const io = req.app.get("socketio");
    if (io) {
      io.to(order.student.toString()).emit("order_arrived", {
        orderId: order.orderId,
        message: "Your delivery rider has arrived at the delivery point!"
      });
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "arrived"
      });
    }

    // Create Notification
    await Notification.create({
      recipient: order.student,
      type: "GENERAL",
      message: `Rider has arrived with order ${order.orderId}! Please meet them at ${order.deliveryLocation}.`
    });

    const sanitizedOrder = sanitizeOrderForRider(order);

    return res.status(200).json({
      success: true,
      message: "Arrival notification sent to student",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in arriveOrder:", error);
    return res.status(500).json({ success: false, message: "Error updating arrival status", error: error.message });
  }
};

/**
 * PUT /api/orders/:id/complete
 * Rider verifies physical dashboard orderId with student and closes the loop.
 */
export const completeOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "completed";
    await order.save();

    // Socket emission to student
    const io = req.app.get("socketio");
    if (io) {
      io.to(order.student.toString()).emit("order_status_update", {
        orderId: order.orderId,
        status: "completed"
      });
    }

    await Notification.create({
      recipient: order.student,
      type: "GENERAL",
      message: `Order ${order.orderId} has been successfully completed. Enjoy your meal!`
    });

    const sanitizedOrder = sanitizeOrderForRider(order);

    return res.status(200).json({
      success: true,
      message: "Order successfully completed",
      order: sanitizedOrder
    });
  } catch (error) {
    console.error("Error in completeOrder:", error);
    return res.status(500).json({ success: false, message: "Error completing order", error: error.message });
  }
};

/**
 * POST /api/orders/:id/nudge
 * Triggered by student to send UI alert directly to targeted Vendor's room.
 * Rate-limited via nudgeRateLimiter.
 */
export const nudgeOrder = async (req, res) => {
  try {
    const order = await findOrderByIdOrCustomId(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const restaurant = await Restaurant.findById(order.restaurant);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Associated restaurant not found" });
    }

    const vendorOwnerId = restaurant.owner.toString();

    // Emit order_nudge socket event directly to targeted vendor's room
    const io = req.app.get("socketio");
    if (io) {
      io.to(vendorOwnerId).emit("order_nudge", {
        orderId: order.orderId,
        message: `Order ${order.orderId} nudge! Student is waiting for an update.`,
        timestamp: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: `Nudge sent successfully to vendor for order ${order.orderId}`
    });
  } catch (error) {
    console.error("Error in nudgeOrder:", error);
    return res.status(500).json({ success: false, message: "Error sending nudge", error: error.message });
  }
};

/**
 * GET /api/orders/marketplace/tickets
 * Endpoint for riders to query available tickets (Zero-Trust: stripped contact numbers)
 */
export const getMarketplaceTickets = async (req, res) => {
  try {
    const tickets = await Order.find({ status: "dispatched", rider: null })
      .select("orderId deliveryLocation totalAmount createdAt")
      .sort({ createdAt: -1 });

    const formattedTickets = tickets.map(t => ({
      orderId: t.orderId,
      deliveryDestination: t.deliveryLocation,
      totalAmount: t.totalAmount,
      createdAt: t.createdAt
    }));

    return res.status(200).json({ success: true, count: formattedTickets.length, tickets: formattedTickets });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching marketplace tickets", error: error.message });
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

    // Zero-Trust check: if user is rider, sanitize
    if (req.user && req.user.role === "rider") {
      return res.status(200).json({ success: true, order: sanitizeOrderForRider(order) });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching order", error: error.message });
  }
};
