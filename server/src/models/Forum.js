import mongoose from "mongoose";

const forumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
  { timestamps: true },
);

const Forum = mongoose.model("Forum", forumSchema);
export default Forum;
