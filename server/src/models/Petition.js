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
    level: {
      type: String,
      enum: ["Class", "Department", "Campus"],
      required: true,
    },
    targetGroup: {
      type: String,
      default: "",
    },
    signatures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    milestone: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending Mod Approval", "Active", "Under Review", "Resolved", "Closed"],
      default: "Active",
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Petition = mongoose.model("Petition", petitionSchema);
export default Petition;
