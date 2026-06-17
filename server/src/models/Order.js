import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({

    name:{type:String, required:true},
    quantity:{type:Number, required:true},
    price:{type: Number, required: true}
})

const orderSchema = new mongoose.Schema({
    student:{type: mongoose.Schema.Types.ObjectId, ref:"User", required: true},
    studentPhone: {type:String, required:true},
    restaurant:{type: mongoose.Schema.Types.ObjectId, ref:"Restaurant", required: true},
    items:[orderItemSchema],
    totalAmount:{type: Number, required: true},
    deliveryLocation:{type: String, default: "University Main Gate"},
    status:{
        type:String,
        enum:["Pending","Preparing", "Dispatched","Delivered","Cancelled"],
        default:"Pending"
    }

},{timestamps: true})

const Order = mongoose.model("Order", orderSchema)
export default Order