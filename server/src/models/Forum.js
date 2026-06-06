import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const forumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    isHidden: {
      type: Boolean,
      default: false,
    },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    replies: [replySchema],
  },
  { timestamps: true }
);

const Forum = mongoose.model('Forum', forumSchema);
export default Forum;