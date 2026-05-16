import mongoose from "mongoose";
import { timeStamp } from "node:console";
import { type } from "node:os";

const forumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectID,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  { timeStamp: true },
);

const Forum = mongoose.model("Forum", forumSchema);
export default Forum;
