import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({

    name:{type:String, required:true},
    quantity:{type:Number, required:true},
    price:{type: Number, required: true}
})

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    contactNumber: { type: String, required: true },
    studentPhone: { type: String },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    deliveryLocation: { type: String, default: "University Main Gate" },
    status: {
        type: String,
        enum: ["pending", "accepted", "preparing", "dispatched", "arrived", "completed", "Pending", "Preparing", "Dispatched", "Delivered", "Cancelled"],
        default: "pending"
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;