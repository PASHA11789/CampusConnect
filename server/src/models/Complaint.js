import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    type: {
      type: String,
      enum: ["suggestion", "complaint"],
      required: true,
      default: "complaint",
    },
    category: {
      type: String,
      enum: [
        "Academics",
        "Canteen",
        "Facilities",
        "Administration",
        "IT Support",
        "Hostel",
        "Security",
        "Other",
      ],
      default: "Other",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    targetDepartment: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },
    adminResponse: {
      response: { type: String, default: "" },
      respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      respondedAt: { type: Date, default: null },
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    escalationReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index for query optimization
complaintSchema.index({ type: 1, status: 1, category: 1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ isEscalated: 1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
