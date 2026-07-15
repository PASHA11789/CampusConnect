import CareerThread from '../models/CareerThread.js';

export const getCareerThreads = async (req, res) => {
  try {
    const { category } = req.query; 
    
    let query = { isFlagged: false, isActive: true, isHidden: false };
    if (category) query.category = category;

    const threads = await CareerThread.find(query)
      .populate('author', 'name avatar role isNameHidden registeration_number')
      .populate('replies.author', 'name avatar role isNameHidden registeration_number')
      .sort({ createdAt: -1 });

    const safeThreads = threads.map(thread => {
      const threadObj = thread.toObject();
      if (threadObj.author && threadObj.author.isNameHidden) {
        threadObj.author.name = `Student ${threadObj.author.registeration_number}`;
      }
      if (threadObj.replies) {
        // Filter out hidden/reported replies for regular clients
        threadObj.replies = threadObj.replies.filter(reply => !reply.isHidden);
        threadObj.replies.forEach(reply => {
          if (reply.author && reply.author.isNameHidden) {
            reply.author.name = `Student ${reply.author.registeration_number}`;
          }
        });
      }
      return threadObj;
    });

    res.status(200).json({ success: true, count: safeThreads.length, threads: safeThreads });
  } catch (error) {
    res.status(500).json({ message: "Error fetching career threads", error: error.message });
  }
};

export const createCareerThread = async (req, res) => {
  try {
    const { title, content, category, isFlagged, flagReason } = req.body;

    if (category === 'job_opportunity' && req.user.role !== 'alumni') {
      return res.status(403).json({ message: "Only Alumni can post direct Job Opportunities." });
    }

    const newThread = await CareerThread.create({
      title,
      content,
      category,
      author: req.user._id,
      isFlagged: isFlagged || false,     
      flagReason: flagReason || null
    });

    res.status(201).json({ success: true, message: "Thread posted successfully", threadId: newThread._id });
  } catch (error) {
    res.status(500).json({ message: "Error creating thread", error: error.message });
  }
};

export const replyToThread = async (req, res) => {
  try {
    const { content, isFlagged } = req.body;

    if (isFlagged) {
       return res.status(400).json({ message: "Reply flagged by moderation. Cannot be posted." });
    }

    const thread = await CareerThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const newReply = {
      author: req.user._id,
      content,
      isHidden: false
    };

    thread.replies.push(newReply);
    await thread.save();

    res.status(201).json({ success: true, message: "Reply added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding reply", error: error.message });
  }
};

export const reportCareerThread = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    if (thread.reportedBy.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You have already reported this thread" });
    }
    thread.reportedBy.push(req.user._id);
    thread.isHidden = true;
    await thread.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_reported_content", {
        message: "A student manually reported a career thread",
        threadId: thread._id,
      });
    }

    res.status(200).json({ success: true, message: "Thread reported to moderators." });
  } catch (error) {
    res.status(500).json({ message: "Server error reporting thread", error: error.message });
  }
};

export const reportCareerReply = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.reportedBy.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "You have already reported this reply" });
    }
    reply.reportedBy.push(req.user._id);
    reply.isHidden = true;
    await thread.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_reported_content", {
        message: "A student manually reported a career reply",
        threadId: thread._id,
        replyId: reply._id,
      });
    }

    res.status(200).json({ success: true, message: "Reply reported and sent to moderators." });
  } catch (error) {
    res.status(500).json({ message: "Server error reporting reply", error: error.message });
  }
};

export const deleteCareerReply = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const authorId = reply.author && (reply.author._id ? reply.author._id.toString() : reply.author.toString());
    if (authorId !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'student_mod') {
      return res.status(403).json({ message: "Not authorized to delete this reply" });
    }

    thread.replies.pull(req.params.replyId);
    await thread.save();

    res.status(200).json({ success: true, message: "Reply deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting reply", error: error.message });
  }
};