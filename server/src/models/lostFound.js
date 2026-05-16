import mongoose from "mongoose";
import { type } from "node:os";

const lostFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      enum: ["LOST", "FOUND"],
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    desription: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageType: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Open", "Claimed", "Returned"],
      default: "Open",
    },
  },
  { timestamps: true },
);

const LostFound = mongoose.model("LostFound", lostFoundSchema);
export default LostFound;
