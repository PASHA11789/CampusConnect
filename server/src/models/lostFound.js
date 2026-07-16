import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["LOST", "FOUND"], 
      required: true 
    },
    itemName: { type: String, required: true, trim: true },
    description: { type: String, required: true }, 
    location: { type: String, required: true },
    surrenderedAt: { type: String, default: "" }, 
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, default: "" }, 
    status: {
      type: String,
      enum: ["Open", "At Office", "Claimed", "Returned"],
      default: "Open",
    },
    isHidden: { type: Boolean, default: false },

    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For manual student reports
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // The "Approved by" stamp

    foundBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    foundLocation: { type: String, default: "" },
    submittedTo: { type: String, default: "" },
    foundAt: { type: Date, default: null }
  },
  { timestamps: true }
);

const LostFound = mongoose.model("LostFound", lostFoundSchema);
export default LostFound;