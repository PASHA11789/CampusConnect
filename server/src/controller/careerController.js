import CareerThread from "../models/CareerThread.js";
import User from "../models/User.js";

// Helper to format safe thread object with author anonymity
const formatSafeThread = (thread, currentUserId, userSavedPosts = []) => {
  const threadObj = thread.toObject ? thread.toObject() : thread;
  const userIdStr = currentUserId ? currentUserId.toString() : null;

  if (threadObj.author && threadObj.author.isNameHidden) {
    threadObj.author.name = `Student ${threadObj.author.registeration_number}`;
  }

  if (threadObj.replies) {
    threadObj.replies = threadObj.replies.filter((reply) => !reply.isHidden);
    threadObj.replies.forEach((reply) => {
      if (reply.author && reply.author.isNameHidden) {
        reply.author.name = `Student ${reply.author.registeration_number}`;
      }
    });
  }

  threadObj.likesCount = threadObj.likes ? threadObj.likes.length : 0;
  threadObj.isLiked = userIdStr && threadObj.likes ? threadObj.likes.some((id) => id.toString() === userIdStr) : false;
  threadObj.isSaved = userIdStr && userSavedPosts ? userSavedPosts.some((id) => id.toString() === threadObj._id.toString()) : false;

  return threadObj;
};

// GET /api/careers - Fetch all career threads with optional filters (category, search)
export const getCareerThreads = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isFlagged: false, isActive: true, isHidden: false };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
        { company: searchRegex },
        { location: searchRegex },
      ];
    }

    const threads = await CareerThread.find(query)
      .populate("author", "name avatar role isNameHidden registeration_number department program")
      .populate("replies.author", "name avatar role isNameHidden registeration_number department program")
      .sort({ createdAt: -1 });

    const currentUser = req.user ? await User.findById(req.user._id).select("savedCareerPosts") : null;
    const savedPostIds = currentUser ? currentUser.savedCareerPosts || [] : [];

    const safeThreads = threads.map((t) => formatSafeThread(t, req.user?._id, savedPostIds));

    res.status(200).json({ success: true, count: safeThreads.length, threads: safeThreads });
  } catch (error) {
    res.status(500).json({ message: "Error fetching career threads", error: error.message });
  }
};

// GET /api/careers/:id - Get single career thread detail & increment view count
export const getCareerThreadById = async (req, res) => {
  try {
    const thread = await CareerThread.findOneAndUpdate(
      { _id: req.params.id, isHidden: false },
      { $inc: { viewsCount: 1 } },
      { new: true }
    )
      .populate("author", "name avatar role isNameHidden registeration_number department program")
      .populate("replies.author", "name avatar role isNameHidden registeration_number department program");

    if (!thread) {
      return res.status(404).json({ message: "Career thread not found" });
    }

    const currentUser = req.user ? await User.findById(req.user._id).select("savedCareerPosts") : null;
    const savedPostIds = currentUser ? currentUser.savedCareerPosts || [] : [];

    const safeThread = formatSafeThread(thread, req.user?._id, savedPostIds);

    res.status(200).json({ success: true, thread: safeThread });
  } catch (error) {
    res.status(500).json({ message: "Error fetching thread details", error: error.message });
  }
};

// POST /api/careers - Create a new career thread
export const createCareerThread = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      location,
      jobType,
      qualification,
      company,
      companyLogo,
      isFlagged,
      flagReason,
    } = req.body;

    const isAlumniOrAdmin =
      req.user.role === "alumni" || req.user.role === "admin" || req.user.role === "campus_admin";

    if (category === "job_opportunity" && !isAlumniOrAdmin) {
      return res.status(403).json({ message: "Only Alumni and Campus Admins can post direct Job Opportunities." });
    }

    const newThread = await CareerThread.create({
      title,
      content,
      category: category || "general_discussion",
      location: location || "",
      jobType: jobType || "",
      qualification: qualification || "",
      company: company || "",
      companyLogo: companyLogo || "",
      author: req.user._id,
      isFlagged: isFlagged || false,
      flagReason: flagReason || null,
      isHidden: isFlagged || false,
    });

    const populatedThread = await CareerThread.findById(newThread._id)
      .populate("author", "name avatar role isNameHidden registeration_number department program")
      .populate("replies.author", "name avatar role isNameHidden registeration_number department program");

    res.status(201).json({
      success: true,
      message: "Thread posted successfully",
      underReview: isFlagged || false,
      thread: formatSafeThread(populatedThread, req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating thread", error: error.message });
  }
};

// POST /api/careers/:id/reply - Reply to career thread
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
      isHidden: false,
    };

    thread.replies.push(newReply);
    await thread.save();

    const updatedThread = await CareerThread.findById(thread._id)
      .populate("author", "name avatar role isNameHidden registeration_number department program")
      .populate("replies.author", "name avatar role isNameHidden registeration_number department program");

    const addedReply = updatedThread.replies[updatedThread.replies.length - 1];

    res.status(201).json({
      success: true,
      message: "Reply added successfully",
      reply: addedReply,
      thread: formatSafeThread(updatedThread, req.user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding reply", error: error.message });
  }
};

// POST /api/careers/:id/like - Toggle like on thread
export const toggleLikeCareerThread = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const userIdStr = req.user._id.toString();
    const existingIndex = thread.likes.findIndex((id) => id.toString() === userIdStr);

    let isLiked = false;
    if (existingIndex >= 0) {
      thread.likes.splice(existingIndex, 1);
      isLiked = false;
    } else {
      thread.likes.push(req.user._id);
      isLiked = true;
    }

    thread.likesCount = thread.likes.length;
    await thread.save();

    res.status(200).json({
      success: true,
      likesCount: thread.likesCount,
      isLiked,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error toggling like", error: error.message });
  }
};

// POST /api/careers/:id/save - Toggle bookmark/save thread
export const toggleSaveCareerThread = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const threadIdStr = req.params.id.toString();
    const existingIndex = user.savedCareerPosts.findIndex((id) => id.toString() === threadIdStr);

    let isSaved = false;
    if (existingIndex >= 0) {
      user.savedCareerPosts.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.savedCareerPosts.push(req.params.id);
      isSaved = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: isSaved ? "Post saved to bookmarks." : "Post removed from bookmarks.",
      isSaved,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error toggling bookmark", error: error.message });
  }
};

// GET /api/careers/saved - Get user's saved/bookmarked career threads
export const getSavedCareerThreads = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedCareerPosts",
      populate: [
        { path: "author", select: "name avatar role isNameHidden registeration_number department program" },
        { path: "replies.author", select: "name avatar role isNameHidden registeration_number department program" },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const savedThreads = (user.savedCareerPosts || []).map((t) => formatSafeThread(t, req.user._id, user.savedCareerPosts));

    res.status(200).json({ success: true, count: savedThreads.length, threads: savedThreads });
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved threads", error: error.message });
  }
};

// GET /api/careers/profile - Get career profile for authenticated user
export const getCareerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const postsCount = await CareerThread.countDocuments({ author: req.user._id, isHidden: false });

    res.status(200).json({
      success: true,
      profile: {
        bio: user.careerBio || "Aspiring Software Engineer & Full-Stack Developer | Passionate about DSA, Web Dev & AI | Lifelong learner.",
        department: user.careerDept || user.department || "BS Computer Science (BSCS)",
        skills: user.careerSkills && user.careerSkills.length > 0 ? user.careerSkills : [
          { name: "Full-Stack Web Development", level: 90 },
          { name: "Data Structures & Algorithms", level: 85 },
          { name: "Python & AI / Machine Learning", level: 80 },
          { name: "Database Management (SQL & NoSQL)", level: 75 },
          { name: "DevOps & Cloud (Git, Docker, AWS)", level: 65 },
        ],
        stats: {
          posts: postsCount,
          connections: 156,
          saved: user.savedCareerPosts ? user.savedCareerPosts.length : 0,
          applications: 7,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching career profile", error: error.message });
  }
};

// PUT /api/careers/profile - Update career profile for authenticated user
export const updateCareerProfile = async (req, res) => {
  try {
    const { bio, department, skills } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (bio !== undefined) user.careerBio = bio;
    if (department !== undefined) user.careerDept = department;
    if (skills !== undefined && Array.isArray(skills)) user.careerSkills = skills;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Career profile and skills updated successfully.",
      profile: {
        bio: user.careerBio,
        department: user.careerDept,
        skills: user.careerSkills,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating career profile", error: error.message });
  }
};

// GET /api/careers/daily-challenge - Daily CS coding challenge pool
export const getDailyChallenge = async (req, res) => {
  const challenges = [
    {
      id: "cs-1",
      title: "Binary Tree Zigzag Level Order Traversal",
      difficulty: "Medium",
      diffColor: "bg-amber-100 text-amber-800 border-amber-200",
      tags: ["DSA", "Trees", "BFS / DFS"],
      estTime: "20 mins",
      solved: "148 Students Solved",
      link: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
    },
    {
      id: "cs-2",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      diffColor: "bg-amber-100 text-amber-800 border-amber-200",
      tags: ["Strings", "Sliding Window", "HashTable"],
      estTime: "15 mins",
      solved: "215 Students Solved",
      link: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    },
    {
      id: "cs-3",
      title: "Merge K Sorted Linked Lists",
      difficulty: "Hard",
      diffColor: "bg-red-100 text-red-800 border-red-200",
      tags: ["Heaps", "Linked List", "Divide & Conquer"],
      estTime: "25 mins",
      solved: "94 Students Solved",
      link: "https://leetcode.com/problems/merge-k-sorted-lists/",
    },
    {
      id: "cs-4",
      title: "Validate Binary Search Tree",
      difficulty: "Medium",
      diffColor: "bg-amber-100 text-amber-800 border-amber-200",
      tags: ["Trees", "DFS", "Binary Search"],
      estTime: "15 mins",
      solved: "182 Students Solved",
      link: "https://leetcode.com/problems/validate-binary-search-tree/",
    },
    {
      id: "cs-5",
      title: "Valid Anagram & Group Anagrams",
      difficulty: "Easy",
      diffColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      tags: ["Strings", "Sorting", "HashTable"],
      estTime: "10 mins",
      solved: "310 Students Solved",
      link: "https://leetcode.com/problems/valid-anagram/",
    },
    {
      id: "cs-6",
      title: "Course Schedule II (Topological Sort)",
      difficulty: "Medium",
      diffColor: "bg-amber-100 text-amber-800 border-amber-200",
      tags: ["Graphs", "Topological Sort", "BFS"],
      estTime: "22 mins",
      solved: "112 Students Solved",
      link: "https://leetcode.com/problems/course-schedule-ii/",
    },
  ];

  res.status(200).json({ success: true, challenges });
};

// DELETE /api/careers/:id - Delete a career thread
export const deleteCareerThread = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const isAuthor = thread.author.toString() === req.user._id.toString();
    const isModOrAdmin = req.user.role === "admin" || req.user.role === "student_mod" || req.user.role === "campus_admin";

    if (!isAuthor && !isModOrAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this thread" });
    }

    await thread.deleteOne();

    res.status(200).json({ success: true, message: "Career thread deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting career thread", error: error.message });
  }
};

// POST /api/careers/:id/report - Report thread
export const reportCareerThread = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    if (thread.reportedBy.some((id) => id.toString() === req.user._id.toString())) {
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

// POST /api/careers/:threadId/replies/:replyId/report - Report reply
export const reportCareerReply = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.reportedBy.some((id) => id.toString() === req.user._id.toString())) {
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

// DELETE /api/careers/:threadId/replies/:replyId - Delete reply
export const deleteCareerReply = async (req, res) => {
  try {
    const thread = await CareerThread.findById(req.params.threadId);
    if (!thread) return res.status(404).json({ message: "Thread not found" });

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const authorId = reply.author && (reply.author._id ? reply.author._id.toString() : reply.author.toString());
    const isAuthor = authorId === req.user._id.toString();
    const isModOrAdmin = req.user.role === "admin" || req.user.role === "student_mod" || req.user.role === "campus_admin";

    if (!isAuthor && !isModOrAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this reply" });
    }

    thread.replies.pull(req.params.replyId);
    await thread.save();

    res.status(200).json({ success: true, message: "Reply deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting reply", error: error.message });
  }
};