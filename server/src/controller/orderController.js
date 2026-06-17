import Order from "../models/Order.js"
import Notificaton from "../models/Notification.js"

export const getVendorQueue = async (req,res)=>{
    try{
        if(req.user.role !== "vendor"){

            return res.status(403).json({message:"Access denied. Vendors only."})
        }
        const orders = await Order.find({
            restaurantId: req.user._id,
            status:{$ne: "Delivered"}
        })
        .populate("student","name registeration_number")
        .sort({createdAt:1})

        res.status(200).json({success: true, count: orders.length, orders})
    }catch(error){
        res.status(500).json({message:"Error fetching queue", error: error.message})
    }
}
export const updateOrderStatus = async(req,res)=>{
    try{
        if(req.user.role !== "vendor"){
            return res.status(403).json({message:"Access denieed."})
        }
        const {status} = req.body
        const order = await Order.findById(req.params.id)

        if(!order) return res.status(404).json({message:"Order not found"})
        if(order.restaurantId.toString() !== req.user._id.toString()){
            return res.status(403).json({message:"Not authorized to upate this order."})
        }    
        order.status = status
        await order.save()

        const io = req.app.get("socketio")

        io.to(order.student.toString()).emit("order_status_update",{
            orderId: order._id,
            status: order.status
        })
        let message = ""
        if(status==="Preparing") message ="The restaurant confirmed your order. They are cooking it now!"
        if(status==="Dispatched") message ="Order dispatched! The rider is heading to the Main Gate and will WhatsApp you."
        if(status==="Cancelled") message ="Your order was cancelled by the restaurant."  
    
        if(message){
            await Notification.create({
                recipient: order.student,
                type:"GENERAL",
                message: message
            })
        }
        res.status(200).json({success: true, message:`Order moved to ${status}`, order})
    }catch(error){
        res.status(500).json({message:"Error updating order", error: error.message})
    }
}
