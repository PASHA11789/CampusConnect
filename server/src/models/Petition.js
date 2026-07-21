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
    image: {
      type: String,
      default: "",
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
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, default: "Inappropriate or offensive content" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

const Petition = mongoose.model("Petition", petitionSchema);
export default Petition;
