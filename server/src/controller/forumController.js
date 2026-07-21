import Forum from "../models/Forum.js"
import Notification from "../models/Notification.js"

export const getForumSummary = async (_req, res) => {
  try {
    const threads = await Forum.find({ isHidden: false })
      .sort({ createdAt: -1 })
      .populate('author', 'registeration_number avatar name')
      .select('title content image repliesCount createdAt author')

    res.status(200).json({
      success: true,
      count: threads.length,
      threads,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load forum feed summary",
      error: error.message,
    })
  }
}

export const createForumThread = async (req, res) => {
  try {
    const { title, content, image, postImage, isFlagged } = req.body
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' })

    const imageUrl = image || postImage || ""

    const newThread = await Forum.create({
      title,
      content,
      image: imageUrl,
      author: req.user._id,
      isHidden: isFlagged || false
    })

    const populatedThread = await Forum.findById(newThread._id)
      .populate('author', 'registeration_number avatar name')
      .select("title content image repliesCount createdAt author")

    const io = req.app.get("socketio")

    if (isFlagged) {
      const warningNotification = await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your recent forum post is under review by moderators to ensure community safety"
      })
      
      io.to(req.user._id.toString()).emit("new_notification", warningNotification);

      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged a new forum post for review",
        threadID: newThread._id
      })

      return res.status(202).json({
        success: true,
        message: "Your post contains specific keywords and has been sent for moderator review.",
        underReview: true
      })
    }

    io.emit('new_forum_thread', {
      message: `${req.user.name} started a new topic!`,
      thread: populatedThread
    });

    res.status(201).json({
      success: true,
      message: 'Discussion thread published!',
      thread: populatedThread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create discussion thread",
      error: error.message,
    });
  }
};

export const updateForumThread = async (req, res) => {
  try {
    const { title, content, image, postImage, isFlagged } = req.body
    const thread = await Forum.findById(req.params.id)

    if (!thread) return res.status(404).json({ message: "Thread not found" })
    if (thread.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the original author can edit this thread" })
    }
    
    thread.title = title || thread.title
    thread.content = content || thread.content
    const newImg = image !== undefined ? image : postImage
    if (newImg !== undefined) thread.image = newImg
    thread.isHidden = isFlagged || false
    await thread.save()

    const io = req.app.get("socketio")

    if (isFlagged) {
      const warningNotification = await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your updated forum post is under review by moderators to ensure community safety"
      })
      
  
      io.to(req.user._id.toString()).emit("new_notification", warningNotification);

      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged an updated forum post for review",
        threadID: thread._id
      })
      
      return res.status(202).json({
        success: true,
        message: "Your post contains specific keywords and has been sent for moderator review.",
        underReview: true
      })
    }

    io.emit("thread_updated", { threadId: thread._id, title: thread.title, content: thread.content })
    res.status(200).json({ success: true, message: 'Thread updated!', thread })

  } catch (error) {
    res.status(500).json({ message: "Server error during updation", error: error.message })
  }
}

export const deleteForumThread = async (req, res) => {
  try {
    const thread = await Forum.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: "Thread not found" })
    if (thread.author.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'student_mod') {
      return res.status(403).json({ message: "Not authorized to delete this thread" })
    }
    await thread.deleteOne()

    const io = req.app.get("socketio")
    io.emit("thread_deleted", { threadID: req.params.id })
    res.status(200).json({ success: true, message: "Thread permanently removed" })

  } catch (error) {
    res.status(500).json({ message: "Server error during deletion", error: error.message })
  }
}

export const toggleHideThread = async (req, res) => {
  try {
    const thread = await Forum.findById(req.params.id)

    if (!thread) return res.status(404).json({ message: "Thread not found" })
    if (req.user.role !== "admin" && req.user.role !== "student_mod") {
      return res.status(403).json({ message: "You do not have permission to moderate threads" })
    }
    
    thread.isHidden = !thread.isHidden

    if(!thread.isHidden){
      thread.moderatedBy = req.user._id
    }
    await thread.save()

    const io = req.app.get("socketio")

    io.emit("thread_moderated", {
      threadId: thread._id,
      isHidden: thread.isHidden,
      moderatedBy : req.user.name
    })
    res.status(200).json({
      success: true,
      message: thread.isHidden ? "Thread hidden from public feed" : "Thread restored to public feed",
      isHidden: thread.isHidden,
      idHidden: thread.isHidden
    })
  } catch (error) {
    res.status(500).json({ message: "Server error during moderation", error: error.message })
  }
}

export const addThreadReply = async (req, res) => {
  try {
    const { content, image, replyImage, postImage, isFlagged, parentId } = req.body
    if (!content) return res.status(400).json({ message: "Reply content can not be empty" })

    const thread = await Forum.findById(req.params.id)
    if (!thread) return res.status(404).json({ message: "Thread not found" })

    const imageUrl = image || replyImage || postImage || ""

    const newReply = { author: req.user._id, content, image: imageUrl, isHidden: isFlagged || false, parentId: parentId || null }
    thread.replies.push(newReply)
    thread.repliesCount = thread.replies.length
    await thread.save()

    const updatedThread = await Forum.findById(thread._id).populate("replies.author", "registeration_number avatar name")
    const savedReply = updatedThread.replies.at(-1);

    const io = req.app.get("socketio")

    if (isFlagged) {
      const warningNotification = await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your recent reply is under review by moderators to ensure community safety",
        relatedItem: thread._id,
        onModel: "Forum"
      })
      
    
      io.to(req.user._id.toString()).emit("new_notification", warningNotification);

      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged a new reply for review",
        threadID: thread._id,
        replyID: savedReply._id
      })
      
      return res.status(202).json({
        success: true,
        message: "Your reply contains flagged keywords and has been sent for moderator review.",
        underReview: true
      })
    }

    io.emit("new_reply", { threadId: thread._id, reply: savedReply, repliesCount: thread.repliesCount })

    if (thread.author.toString() !== req.user._id.toString()) {
      const replyNotification = await Notification.create({
        recipient: thread.author,
        type: 'FORUM',
        message: `${req.user.name || 'A student'} replied to your discussion: "${thread.title}"`,
        relatedItem: thread._id,
        onModel: 'Forum'
      });

      io.to(thread.author.toString()).emit('new_notification', replyNotification);
    }

    res.status(201).json({ success: true, reply: savedReply, underReview: false })

  } catch (error) {
    res.status(500).json({ message: "Server error adding reply", error: error.message })
  }
}

export const updateThreadReply = async (req, res) => {
  try {
    const { content, image, replyImage, postImage, isFlagged } = req.body
    const thread = await Forum.findById(req.params.threadId)
    if (!thread) return res.status(404).json({ message: "Thread not found" })

    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: "Reply not found" })

    const authorId = reply.author && (reply.author._id ? reply.author._id.toString() : reply.author.toString());
    if (authorId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the original author can edit this reply" })
    }

    reply.content = content || reply.content
    const newImg = image !== undefined ? image : (replyImage !== undefined ? replyImage : postImage)
    if (newImg !== undefined) reply.image = newImg
    reply.isHidden = isFlagged || false
    await thread.save()

    const io = req.app.get("socketio")

    if (isFlagged) {
      const warningNotification = await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your updated reply is under review by moderators to ensure community safety"
      })
      
      io.to(req.user._id.toString()).emit("new_notification", warningNotification);

      io.to("mod_room").emit("new_flagged_content", {
        message: "AI flagged an updated reply for review",
        threadID: thread._id,
        replyID: reply._id
      })
      return res.status(202).json({
        success: true,
        message: "Your reply contains flagged keywords and has been sent for moderator review.",
        underReview: true
      })
    }

    io.emit("reply_updated", { threadId: thread._id, replyid: reply._id, content: reply.content })

    res.status(200).json({ success: true, reply })
  } catch (error) {
    res.status(500).json({ message: "Server error updating reply", error: error.message })
  }
}

export const deleteThreadReply = async (req, res) => {
  try {
    const thread = await Forum.findById(req.params.threadId)
    if (!thread) return res.status(404).json({ message: "Thread not found" })

    const reply = thread.replies.id(req.params.replyId)
    if (!reply) return res.status(404).json({ message: "Reply not found" })

    const authorId = reply.author && (reply.author._id ? reply.author._id.toString() : reply.author.toString());
    if (authorId !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'student_mod') {
      return res.status(403).json({ message: "Only the original author can delete this reply" })
    }

    const toDeleteIds = [req.params.replyId];
    thread.replies.forEach((r) => {
      if (r.parentId && r.parentId.toString() === req.params.replyId.toString()) {
        toDeleteIds.push(r._id.toString());
      }
    });

    toDeleteIds.forEach((id) => {
      thread.replies.pull(id);
    });

    thread.repliesCount = thread.replies.length
    await thread.save()

    const io = req.app.get("socketio")
    io.emit('reply_deleted', { threadId: thread._id, replyId: req.params.replyId, repliesCount: thread.repliesCount });

    res.status(200).json({ success: true, message: "Reply removed" })

  } catch (error) {
    res.status(500).json({ message: "Server error deleting reply", error: error.message })
  }
};

export const getForumThreadById = async (req, res) => {
  try {
    const thread = await Forum.findById(req.params.id)
      .populate("author", "registeration_number avatar")
      .populate("replies.author", "registeration_number avatar");

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    res.status(200).json({
      success: true,
      thread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch thread details",
      error: error.message
    });
  }
};

export const reportForumThread = async (req, res) => {
  try {
    const { reason } = req.body;
    const thread = await Forum.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });
    
    if (thread.reportedBy.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You have already reported this thread" });
    }
    const reportReason = reason || "Inappropriate or offensive content";
    thread.reportedBy.push(req.user._id);
    if (!thread.reports) thread.reports = [];
    thread.reports.push({ user: req.user._id, reason: reportReason });
    thread.isHidden = true;
    await thread.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_reported_content", {
        message: `A student reported a forum thread: "${reportReason}"`,
        threadId: thread._id,
        reason: reportReason,
      });
    }

    await Notification.create({
      recipient: thread.author,
      type: "GENERAL",
      message: "Your forum post was flagged by the community and is temporarily hidden and pending for moderator review",
      relatedItem: thread._id,
      onModel: "Forum"
    });
    res.status(200).json({ success: true, message: "Thread reported and sent to the moderators." });
  } catch (error) {
    res.status(500).json({ message: "Server error reporting thread", error: error.message });
  }
};

export const reportThreadReply = async (req, res) => {
  try {
    const { reason } = req.body;
    const thread = await Forum.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.reportedBy.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You have already reported this reply" });
    }
    const reportReason = reason || "Inappropriate or offensive content";
    reply.reportedBy.push(req.user._id);
    if (!reply.reports) reply.reports = [];
    reply.reports.push({ user: req.user._id, reason: reportReason });
    reply.isHidden = true;
    await thread.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_reported_content", {
        message: `A student reported a reply: "${reportReason}"`,
        threadId: thread._id,
        replyId: reply._id,
        reason: reportReason,
      });
    }

    await Notification.create({
      recipient: reply.author,
      type: "GENERAL",
      message: "Your reply was flagged by the community and is temporarily hidden pending moderator review",
      relatedItem: thread._id,
      onModel: "Forum",
    });
    res.status(200).json({ success: true, message: "Reply reported and sent to moderators." });
  } catch (error) {
    res.status(500).json({ message: "Server error reporting reply", error: error.message });
  }
}; 