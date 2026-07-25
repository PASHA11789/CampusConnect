import Restaurant from '../models/Restaurants.js'
import Order from "../models/Order.js"
import Notification from "../models/Notification.js"


export const addMenuItem = async (req,res)=>{
    try{
        const {name, price, description, image} = req.body;
        const imageUrl = req.file && req.file.path? req.file.path : (image || "");

        const restaurant = await Restaurant.findOne({owner: req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found"})
         
        const newItem = {name, price, description, image: imageUrl, isAvailable:true}
        restaurant.menu.push(newItem)
        restaurant.isActive = false; // Closed for now since menu is updating
        await restaurant.save()
        
        res.status(201).json({success:true, message:"Menu item added", menu: restaurant.menu})
    }catch(error){
        res.status(500).json({message:"Failed to add menu item", error: error.message})
    }
}

export const updateMenuItem = async (req,res) =>{
    try{
        const {name, price, description, isAvailable, image} = req.body;
        const restaurant = await Restaurant.findOne({owner:req.user._id})
        if(!restaurant) return res.status(404).json({message: "Restaurant profile not found"})
        
        const item = restaurant.menu.id(req.params.itemId)
        if(!item) return res.status(404).json({message:"Menu item not found"})
        
        if(name) item.name = name
        if(price) item.price = price
        if(description) item.description = description
        if (isAvailable !== undefined) item.isAvailable = isAvailable; 
        if (req.file && req.file.path) {
            item.image = req.file.path;
        } else if (image !== undefined) {
            item.image = image;
        }
        restaurant.isActive = false; // Closed for now since menu is updating
        await restaurant.save();
        res.status(200).json({ success: true, message: "Menu item updated", item });
    }catch(error){
        res.status(500).json({ message: "Failed to update item", error: error.message });
    }
}

export const deleteMenuItem = async (req,res) =>{
    try{
        const restaurant = await Restaurant.findOne({owner:req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found."})
        restaurant.menu.pull(req.params.itemId)
        restaurant.isActive = false; // Closed for now since menu is updating
        await restaurant.save()
        
        res.status(200).json({success:true, message:"Menu item deleted"})
    }catch(error){
        res.status(500).json({ message: "Failed to delete item", error: error.message });
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
        res.status(500).json({message:"Error fetching queue",error: error.message})
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
        // Notify assigned rider specifically — "Come pick it up NOW!"
        if (order.rider) {
          io.to(order.rider.toString()).emit("order_ready_for_pickup", {
            orderId: order.orderId,
            message: `🍔 Order ${order.orderId} is READY for pickup at ${restaurant.name}! Head over now.`,
            restaurantName: restaurant.name,
            deliveryDestination: order.deliveryLocation
          });
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

    // ─── TERMINAL: Vendor CANCELS ───
    if (normalizedStatus === "cancelled") {
      if (["completed", "cancelled"].includes(order.status)) {
        return res.status(400).json({ message: `Order is already '${order.status}' and cannot be cancelled.` });
      }
      order.status = "cancelled";
      await order.save();

      if (io) {
        io.to(order.student.toString()).emit("order_status_update", {
          orderId: order.orderId,
          status: "cancelled",
          message: `We're sorry — your order from ${restaurant.name} has been cancelled.`
        });
        if (order.rider) {
          io.to(order.rider.toString()).emit("order_status_update", {
            orderId: order.orderId,
            status: "cancelled",
            message: `Order ${order.orderId} was cancelled by the vendor.`
          });
          // Remove from rider's active order
          io.to("riders").emit("ticket_cancelled", { orderId: order.orderId });
        }
      }

      await Notification.create({
        recipient: order.student,
        type: "CANTEEN",
        message: `Your order ${order.orderId} from ${restaurant.name} has been cancelled. We apologize for the inconvenience.`
      });

      return res.status(200).json({ success: true, message: "Order cancelled.", order });
    }

    return res.status(400).json({ message: `Unknown status: '${status}'. Valid vendor actions: accepted, preparing, ready, cancelled.` });

  } catch (error) {
    return res.status(500).json({ message: "Error updating order", error: error.message });
  }
};


export const getVendorRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant details", error: error.message });
  }
};

export const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ message: "Restaurant profile not found" });
    
    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    
    res.status(200).json({ success: true, message: `Restaurant is now ${restaurant.isActive ? "Open" : "Closed"}`, isActive: restaurant.isActive });
  } catch (error) {
    res.status(500).json({ message: "Error toggling restaurant status", error: error.message });
  }
};