import mongoose from "mongoose";

const petitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currentSignatures: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Under Review", "Resolved", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true },
);

const Petition = mongoose.model("Petition", petitionSchema);
export default Petition;
