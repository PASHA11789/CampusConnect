import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      default: "vendor",
    },
    restaurantName: { type: String, default: "" },
    phone: { type: String, default: "" },
    registeration_number: { type: String, required: true, unique: true },
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?name=Vendor&background=random",
    },
  },
  { timestamps: true }
);

vendorSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
