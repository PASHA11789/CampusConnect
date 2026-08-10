import Restaurant from '../models/Restaurants.js'
import Order from "../models/Order.js"
import Notification from "../models/Notification.js"
import User from "../models/User.js"
import { sendWebPushNotification } from "../utils/pushNotification.js"

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";


export const addMenuItem = async (req,res)=>{
    try{
        const {name, price, category, description, image} = req.body;
        const imageUrl = req.file && req.file.path? req.file.path : (image || "");

        const restaurant = await Restaurant.findOne({owner: req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found"})
         
        const newItem = {
          name: name.trim(),
          price: Number(price),
          category: (category || "Fast Food").trim(),
          description: description || "",
          image: imageUrl,
          isAvailable: true
        }
        restaurant.menu.push(newItem)
        await restaurant.save()
        
        const io = req.app.get("socketio");
        if (io) {
          io.emit("restaurant_menu_update", { restaurantId: restaurant._id, menu: restaurant.menu });
        }

        res.status(201).json({success:true, message:"Menu item added", menu: restaurant.menu})
    }catch(error){
        res.status(500).json({message:"Failed to add menu item", error: safeError(error)})
    }
}

export const updateMenuItem = async (req,res) =>{
    try{
        const {name, price, category, description, isAvailable, image} = req.body;
        const restaurant = await Restaurant.findOne({owner:req.user._id})
        if(!restaurant) return res.status(404).json({message: "Restaurant profile not found"})
        
        const item = restaurant.menu.id(req.params.itemId)
        if(!item) return res.status(404).json({message:"Menu item not found"})
        
        if(name !== undefined) item.name = name.trim();
        if(price !== undefined) item.price = Number(price);
        if(category !== undefined) item.category = category.trim();
        if(description !== undefined) item.description = description;
        if (isAvailable !== undefined) item.isAvailable = Boolean(isAvailable); 
        if (req.file && req.file.path) {
            item.image = req.file.path;
        } else if (image !== undefined) {
            item.image = image;
        }
        await restaurant.save();

        const io = req.app.get("socketio");
        if (io) {
          io.emit("restaurant_menu_update", { restaurantId: restaurant._id, menu: restaurant.menu });
        }

        res.status(200).json({ success: true, message: "Menu item updated", item, menu: restaurant.menu });
    }catch(error){
        res.status(500).json({ message: "Failed to update item", error: safeError(error) });
    }
}

export const deleteMenuItem = async (req,res) =>{
    try{
        const restaurant = await Restaurant.findOne({owner:req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found."})
        restaurant.menu.pull(req.params.itemId)
        await restaurant.save()
        
        const io = req.app.get("socketio");
        if (io) {
          io.emit("restaurant_menu_update", { restaurantId: restaurant._id, menu: restaurant.menu });
        }

        res.status(200).json({success:true, message:"Menu item deleted", menu: restaurant.menu})
    }catch(error){
        res.status(500).json({ message: "Failed to delete item", error: safeError(error) });
    }
}

export const getVendorQueue = async (req,res)=>{
    try{
        const restaurant = await Restaurant.findOne({owner: req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found"})

        const orders = await Order.find({
            restaurant:restaurant._id,
            status:{$ne:"Delivered"}
        })
        .populate("student","name registeration_number")
        .sort({createdAt: 1})
        res.status(200).json({success:true, count:orders.length, orders})
    }catch(error){
        res.status(500).json({message:"Error fetching queue",error: safeError(error)})
    }
}
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Find order by Mongoose _id or custom orderId
    let order = await Order.findById(req.params.orderId).catch(() => null);
    if (!order) order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });
    if (order.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    const io = req.app.get("socketio");
    const normalizedStatus = status?.toLowerCase();

    // ─── STAGE 2: Vendor ACCEPTS → create rider ticket immediately ───
    if (normalizedStatus === "accepted") {
      if (order.status !== "pending") {
        return res.status(400).json({ message: `Cannot accept an order that is already '${order.status}'` });
      }
      order.status = "accepted";
      await order.save();

      const destination = order.deliveryLocation || "University Main Gate";

      if (io) {
        // Broadcast ticket to all riders
        io.to("riders").emit("new_ticket", {
          orderId: order.orderId,
          deliveryDestination: destination,
          totalAmount: order.totalAmount,
          restaurantName: restaurant.name,
          createdAt: order.createdAt
        });
        // Notify student
        io.to(order.student.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "accepted",
          message: `Your order from ${restaurant.name} has been accepted! Finding a rider...`
        });
        // Update vendor's own dashboard (for multi-tab sync)
        io.to(restaurant.owner.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "accepted"
        });
      }

      await Notification.create({
        recipient: order.student,
        type: "CANTEEN",
        message: `Your order ${order.orderId} from ${restaurant.name} has been accepted! We're finding a rider for you.`
      });

      return res.status(200).json({
        success: true,
        message: "Order accepted! Rider ticket created and dispatched to marketplace.",
        order
      });
    }

    // ─── STAGE 3: Vendor marks PREPARING ───
    if (normalizedStatus === "preparing") {
      if (!["accepted"].includes(order.status)) {
        return res.status(400).json({ message: `Order must be 'accepted' before marking as preparing. Current: '${order.status}'` });
      }
      order.status = "preparing";
      await order.save();

      if (io) {
        io.to(order.student.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "preparing",
          message: `Your order from ${restaurant.name} is now being prepared! 🍳`
        });
        // Broadcast new ticket to all riders
        io.to("riders").emit("new_ticket", {
          orderId: order.orderId,
          deliveryDestination: order.deliveryLocation || "University Main Gate",
          totalAmount: order.totalAmount,
          restaurantName: restaurant.name,
          createdAt: order.createdAt
        });
        // Notify assigned rider if any
        if (order.rider) {
          io.to(order.rider.toString()).emit("order_status_update", {
            orderId: order.orderId,
            status: "preparing",
            message: `Order ${order.orderId} is now being prepared at ${restaurant.name}.`
          });
        }
        io.to(restaurant.owner.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "preparing"
        });
      }

      await Notification.create({
        recipient: order.student,
        type: "CANTEEN",
        message: `Your order ${order.orderId} from ${restaurant.name} is now being prepared! 🍳`
      });

      return res.status(200).json({
        success: true,
        message: "Order marked as preparing.",
        order
      });
    }

    // ─── STAGE 4: Vendor marks READY FOR PICKUP ───
    if (normalizedStatus === "ready") {
      if (!["preparing"].includes(order.status)) {
        return res.status(400).json({ message: `Order must be 'preparing' before marking as ready. Current: '${order.status}'` });
      }
      order.status = "ready";
      await order.save();

      if (io) {
        const readyPayload = {
          orderId: order.orderId,
          status: "ready",
          message: `🍔 Order #${order.orderId} is READY for pickup at ${restaurant.name}! Head over now.`,
          restaurantName: restaurant.name,
          deliveryDestination: order.deliveryLocation
        };

        // Broadcast ready notification to riders pool
        io.to("riders").emit("order_ready_for_pickup", readyPayload);

        // Notify assigned rider specifically — "Come pick it up NOW!"
        if (order.rider) {
          io.to(order.rider.toString()).emit("order_ready_for_pickup", readyPayload);
        } else {
          // No rider claimed yet — re-broadcast ticket as urgent to riders pool
          io.to("riders").emit("new_ticket", {
            orderId: order.orderId,
            deliveryDestination: order.deliveryLocation || "University Main Gate",
            totalAmount: order.totalAmount,
            restaurantName: restaurant.name,
            urgent: true,
            createdAt: order.createdAt
          });
        }
        // Notify student
        io.to(order.student.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "ready",
          message: `Your food is ready! The rider is picking it up now. 🛵`
        });
        io.to(restaurant.owner.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "ready"
        });
      }

      await Notification.create({
        recipient: order.student,
        type: "CANTEEN",
        message: `Your order ${order.orderId} is ready and waiting for the rider! 🍔`
      });

      return res.status(200).json({
        success: true,
        message: order.rider ? "Order marked ready — rider has been notified to pick up!" : "Order marked ready — re-broadcasting to rider pool.",
        order
      });
    }

    // ─── TERMINAL: Vendor CANCELS (Available at all active stages: pending, accepted, preparing, ready, picked_up, arrived) ───
    if (normalizedStatus === "cancelled") {
      if (["completed", "cancelled"].includes(order.status)) {
        return res.status(400).json({ message: `Order is already '${order.status}' and cannot be cancelled.` });
      }

      const { reason, cancellationReason } = req.body;
      const finalReason = cancellationReason || reason || "Cancelled by restaurant";

      order.status = "cancelled";
      await order.save();

      if (io) {
        // 1. Notify Student
        io.to(order.student.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "cancelled",
          reason: finalReason,
          message: `We're sorry — your order from ${restaurant.name} has been cancelled.${finalReason ? ` Reason: ${finalReason}` : ""}`
        });

        // 2. Notify Rider if assigned
        if (order.rider) {
          const riderIdStr = order.rider._id ? order.rider._id.toString() : order.rider.toString();
          io.to(riderIdStr).emit("order_status_update", {
            orderId: order.orderId,
            status: "cancelled",
            reason: finalReason,
            message: `Order ${order.orderId} from ${restaurant.name} was cancelled by the vendor.${finalReason ? ` Reason: ${finalReason}` : ""}`
          });
          io.to(riderIdStr).emit("ticket_cancelled", { orderId: order.orderId });
        }

        // 3. Broadcast to all riders to remove ticket from open marketplace pool
        io.to("riders").emit("ticket_cancelled", { orderId: order.orderId });

        // 4. Sync vendor's other open tabs
        io.to(restaurant.owner.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "cancelled"
        });
      }

      // In-app DB Notification for Student
      await Notification.create({
        recipient: order.student,
        type: "CANTEEN",
        message: `Your order ${order.orderId} from ${restaurant.name} has been cancelled.${finalReason ? ` Reason: ${finalReason}` : " We apologize for the inconvenience."}`
      });

      // In-app DB Notification for Rider (if assigned)
      if (order.rider) {
        await Notification.create({
          recipient: order.rider,
          type: "CANTEEN",
          message: `Order ${order.orderId} from ${restaurant.name} was cancelled by the vendor.${finalReason ? ` Reason: ${finalReason}` : ""}`
        });
      }

      // Web Push fallback for student
      User.findById(order.student).select("pushSubscription").then((studentDoc) => {
        if (studentDoc?.pushSubscription) {
          sendWebPushNotification(studentDoc.pushSubscription, {
            title: "❌ Order Cancelled — CampusConnect",
            body: `Your order ${order.orderId} from ${restaurant.name} was cancelled.${finalReason ? ` Reason: ${finalReason}` : ""}`,
            url: "/canteen"
          });
        }
      }).catch(() => {});

      // Web Push fallback for rider
      if (order.rider) {
        User.findById(order.rider).select("pushSubscription").then((riderDoc) => {
          if (riderDoc?.pushSubscription) {
            sendWebPushNotification(riderDoc.pushSubscription, {
              title: "❌ Delivery Cancelled — CampusConnect",
              body: `Order ${order.orderId} from ${restaurant.name} was cancelled.`,
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
    }

    return res.status(400).json({ message: `Unknown status: '${status}'. Valid vendor actions: accepted, preparing, ready, cancelled.` });

  } catch (error) {
    return res.status(500).json({ message: "Error updating order", error: safeError(error) });
  }
};


export const getVendorRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant details", error: safeError(error) });
  }
};

export const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });
    
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    
    const io = req.app.get("socketio");
    if (io) {
      io.emit("restaurant_status_update", { restaurantId: restaurant._id, isActive: restaurant.isActive });
    }

    res.status(200).json({ success: true, message: `Restaurant is now ${restaurant.isActive ? "Open" : "Closed"}`, isActive: restaurant.isActive, restaurant });
  } catch (error) {
    res.status(500).json({ message: "Error toggling restaurant status", error: safeError(error) });
  }
};

export const updateVendorRestaurant = async (req, res) => {
  try {
    const { address, coverImage, name, phone, email } = req.body;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });

    if (address !== undefined) restaurant.address = address;
    if (coverImage !== undefined) restaurant.coverImage = coverImage;
    if (name !== undefined) restaurant.name = name;
    if (phone !== undefined) restaurant.phone = phone;

    await restaurant.save();

    // Sync Vendor owner details
    const vendorUpdate = {};
    if (email !== undefined && email.trim()) vendorUpdate.email = email.trim();
    if (coverImage !== undefined) vendorUpdate.avatar = coverImage;
    if (name !== undefined && name.trim()) {
      vendorUpdate.name = name.trim();
      vendorUpdate.restaurantName = name.trim();
    }
    if (phone !== undefined) vendorUpdate.phone = phone;

    if (Object.keys(vendorUpdate).length > 0) {
      await Vendor.findByIdAndUpdate(req.user._id, vendorUpdate);
    }

    const io = req.app.get("socketio");
    if (io) {
      io.emit("restaurant_updated", { restaurantId: restaurant._id, restaurant });
    }

    res.status(200).json({ success: true, message: "Restaurant profile updated successfully", restaurant });
  } catch (error) {
    res.status(500).json({ message: "Error updating restaurant profile", error: safeError(error) });
  }
};

export const getVendorRiders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });

    const riders = await User.find({
      role: "rider",
      $or: [{ restaurant: restaurant._id }, { department: "Campus Delivery" }]
    }).select("-password");

    res.status(200).json({ success: true, count: riders.length, riders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching riders", error: safeError(error) });
  }
};

export const createVendorRider = async (req, res) => {
  try {
    const { name, email, password, phone, vehicle, registeration_number } = req.body;
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });

    if (!name || !email || !password || !registeration_number) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password, registeration_number)" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { registeration_number }] });
    if (existingUser) {
      return res.status(400).json({ message: "Rider with this email or registration number already exists." });
    }

    const rider = await User.create({
      name,
      email,
      password,
      registeration_number,
      role: "rider",
      restaurant: restaurant._id,
      department: "Campus Delivery",
      vehicle: vehicle || "Motorcycle",
      riderPhone: phone || "",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A2342&color=fff`
    });

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.status(201).json({ success: true, message: "Delivery rider created successfully", rider: riderObj });
  } catch (error) {
    res.status(500).json({ message: "Error creating rider", error: safeError(error) });
  }
};

export const updateVendorRider = async (req, res) => {
  try {
    const { name, email, phone, vehicle, riderStatus, password } = req.body;
    const rider = await User.findById(req.params.riderId);
    if (!rider || rider.role !== "rider") {
      return res.status(404).json({ message: "Rider account not found" });
    }

    if (name) rider.name = name;
    if (email) rider.email = email;
    if (phone !== undefined) rider.riderPhone = phone;
    if (vehicle) rider.vehicle = vehicle;
    if (riderStatus) rider.riderStatus = riderStatus;
    if (password && password.trim()) rider.password = password;

    await rider.save();

    const riderObj = rider.toObject();
    delete riderObj.password;

    res.status(200).json({ success: true, message: "Rider details updated", rider: riderObj });
  } catch (error) {
    res.status(500).json({ message: "Error updating rider", error: safeError(error) });
  }
};

export const deleteVendorRider = async (req, res) => {
  try {
    const rider = await User.findById(req.params.riderId);
    if (!rider || rider.role !== "rider") {
      return res.status(404).json({ message: "Rider account not found" });
    }

    await User.findByIdAndDelete(req.params.riderId);
    res.status(200).json({ success: true, message: "Rider deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting rider", error: safeError(error) });
  }
};