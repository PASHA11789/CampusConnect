import CareerThread from '../models/CareerThread.js';


export const getCareerThreads = async (req, res) => {
  try {
    const { category } = req.query; 
    
    let query = { isFlagged: false, isActive: true };
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
      content
    };

    thread.replies.push(newReply);
    await thread.save();

    res.status(201).json({ success: true, message: "Reply added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding reply", error: error.message });
  }
};