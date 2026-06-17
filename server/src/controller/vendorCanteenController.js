import Restaurant from '../models/Restaurants.js'
import Order from "../models/Order.js"
import Notification from "../models/Notification.js"


export const addMenuItem = async (req,res)=>{
    try{
        const {name, price, description} = req.body
        const imageUrl = req.file && req.file.path? req.file.path :""

        const restaurant = await Restaurant.findOne({owner: req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found"})
         
        const newItem = {name, price, description, image: imageUrl, isAvailable:true}
        restaurant.menu.push(newItem)
        await restaurant.save()
        
        res.status(201).json({success:true, message:"Menu item added", menu: restaurant.menu})
    }catch(error){
        res.status(500).json({message:"Failed to add menu item", error: error.message})
    }
}

export const updateMenuItem = async (req,res) =>{
    try{
        const {name, price, description, isAvailable} = req.body
        const restaurant = await Restaurant.findOne({owner:req.user._id})
        if(!restaurant) return res.status(404).json({message: "Restaurant profile not found"})
        
        const item = restaurant.menu.id(req.params.itemId)
        if(!item) return res.status(404).json({message:"Menu item not found"})
        
        if(name) item.name = name
        if(price) item.price = price
        if(description) item.description = description
        if (isAvailable !== undefined) item.isAvailable = isAvailable; 
        if (req.file && req.file.path) item.image = req.file.path;
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
export const updateOrderStatus = async (req, res) =>{
    try{
        const {status} = req.body 
        const order = await Order.findById(req.params.orderId)
        if(!order) return res.status(404).json({message:"Order not found"})
        
        const restaurant  = await Restaurant.findOne({owner: req.user._id})
        if(!restaurant) return res.status(404).json({message:"Restaurant profile not found"})
 
        if (order.restaurant.toString() !== restaurant._id.toString()) {
           return res.status(403).json({ message: "Not authorized to update this order" });
       }
       order.status = status 
       await order.save()

       const io = req.app.get("socketio")
       io.to(order.student.toString()).emit("order_status_update",{
        orderId : order._id,
        status: order.status
       })

    let message = "";
    if (status === "Preparing") message = `Your order from ${restaurant.name} is confirmed and being prepared!`;
    if (status === "Dispatched") message = "Order dispatched! The rider is heading to the gate.";
    if (status === "Cancelled") message = `Your order was cancelled by ${restaurant.name}.`;

    if (message) {
      await Notification.create({ recipient: order.student, type: "GENERAL", message });
    }

    res.status(200).json({ success: true, message: `Order moved to ${status}`, order });
     }catch(error){
        res.status(500).json({ message: "Error updating order", error: error.message });
     }
}