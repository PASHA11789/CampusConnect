import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

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
    enum: [
      "pending",      // Stage 1: Order placed, awaiting vendor response
      "accepted",     // Stage 2: Vendor accepted, ticket in rider pool
      "preparing",    // Stage 3: Vendor is preparing the food
      "ready",        // Stage 4: Food ready, awaiting rider pickup
      "picked_up",    // Stage 5: Rider picked up, en route to student
      "arrived",      // Stage 6: Rider at delivery location
      "completed",    // Stage 7: Order handed to student, done
      "cancelled"     // Terminal: Vendor rejected or cancelled
    ],
    default: "pending"
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;