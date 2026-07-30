import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

// @desc    Create a new Suggestion or Complaint
// @route   POST /api/complaints
// @access  Private (Students, Alumni, Campus Members)
export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      type = "complaint",
      category = "Other",
      isAnonymous = false,
      priority = "Medium",
      targetDepartment = "",
      images = [],
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required." });
    }

    if (!["suggestion", "complaint"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'suggestion' or 'complaint'." });
    }

    const complaint = await Complaint.create({
      title,
      description,
      type,
      category,
      submittedBy: req.user._id,
      isAnonymous: Boolean(isAnonymous),
      priority,
      targetDepartment,
      images,
    });

    const populatedComplaint = await Complaint.findById(complaint._id).populate(
      "submittedBy",
      "name registeration_number avatar department role"
    );

    // Broadcast socket event to mod room
    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_mod_queue_item", {
        type: complaint.type === "suggestion" ? "suggestion" : "complaint",
        item: populatedComplaint,
      });
    }

    res.status(201).json({
      success: true,
      message: `${type === "suggestion" ? "Suggestion" : "Complaint"} submitted successfully.`,
      complaint: populatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit complaint/suggestion",
      error: error.message,
    });
  }
};

// @desc    Get all suggestions/complaints with filters, search, and pagination
// @route   GET /api/complaints
// @access  Private
export const getAllComplaints = async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      priority,
      isEscalated,
      search,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (isEscalated !== undefined) query.isEscalated = isEscalated === "true";

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { targetDepartment: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    const complaints = await Complaint.find(query)
      .populate("submittedBy", "name registeration_number avatar department role")
      .populate("adminResponse.respondedBy", "name registeration_number avatar role")
      .populate("escalatedBy", "name registeration_number avatar role")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Complaint.countDocuments(query);

    // Sanitize anonymous submissions for general users if not admin/mod
    const isStaff = ["admin", "campus_admin", "student_mod"].includes(req.user.role);

    const formattedComplaints = complaints.map((c) => {
      const obj = c.toObject();
      if (obj.isAnonymous && !isStaff && req.user._id.toString() !== obj.submittedBy?._id?.toString()) {
        obj.submittedBy = {
          _id: obj.submittedBy?._id,
          name: "Anonymous User",
          avatar: "https://ui-avatars.com/api/?name=Anonymous&background=6c757d&color=fff",
          department: "Hidden",
        };
      }
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formattedComplaints.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      complaints: formattedComplaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaints/suggestions",
      error: error.message,
    });
  }
};

// @desc    Get user's own submitted suggestions/complaints
// @route   GET /api/complaints/my
// @access  Private
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user._id })
      .populate("adminResponse.respondedBy", "name registeration_number avatar role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your complaints/suggestions",
      error: error.message,
    });
  }
};

// @desc    Get single suggestion/complaint detail by ID
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("submittedBy", "name registeration_number avatar department role")
      .populate("adminResponse.respondedBy", "name registeration_number avatar role")
      .populate("escalatedBy", "name registeration_number avatar role");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint or suggestion not found." });
    }

    const isStaff = ["admin", "campus_admin", "student_mod"].includes(req.user.role);
    const obj = complaint.toObject();

    if (obj.isAnonymous && !isStaff && req.user._id.toString() !== obj.submittedBy?._id?.toString()) {
      obj.submittedBy = {
        _id: obj.submittedBy?._id,
        name: "Anonymous User",
        avatar: "https://ui-avatars.com/api/?name=Anonymous&background=6c757d&color=fff",
        department: "Hidden",
      };
    }

    res.status(200).json({
      success: true,
      complaint: obj,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaint detail",
      error: error.message,
    });
  }
};

// @desc    Update complaint/suggestion status, priority, and admin response (Mod Room / Admin)
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin, Campus Admin, Student Mod)
export const updateComplaintStatus = async (req, res) => {
  try {
    const { status, priority, response } = req.body;

    if (!["admin", "campus_admin", "student_mod"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Only moderators and admins can address complaints." });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint or suggestion not found." });
    }

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;

    if (response) {
      complaint.adminResponse = {
        response,
        respondedBy: req.user._id,
        respondedAt: new Date(),
      };
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate("submittedBy", "name registeration_number avatar department role")
      .populate("adminResponse.respondedBy", "name registeration_number avatar role");

    // Notify author if not anonymous
    await Notification.create({
      recipient: complaint.submittedBy,
      type: "COMPLAINT",
      message: `Your ${complaint.type} "${complaint.title}" has been updated to status "${complaint.status}".${
        response ? " Admin comment added." : ""
      }`,
      relatedItem: complaint._id,
      onModel: "Complaint",
    });

    const io = req.app.get("socketio");
    if (io) {
      io.to(complaint.submittedBy.toString()).emit("complaint_status_updated", {
        complaintId: complaint._id,
        status: complaint.status,
        adminResponse: complaint.adminResponse,
      });

      io.to("mod_room").emit("mod_queue_item_updated", {
        type: "complaint",
        item: updatedComplaint,
      });
    }

    res.status(200).json({
      success: true,
      message: `${complaint.type === "suggestion" ? "Suggestion" : "Complaint"} status updated successfully.`,
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint status",
      error: error.message,
    });
  }
};

// @desc    Ping / Escalate serious complaint or suggestion to Campus Admins
// @route   POST /api/complaints/:id/ping-admin
// @access  Private (Student Mods, Admins)
export const pingAdminsForComplaint = async (req, res) => {
  try {
    const { reason = "High severity issue requiring campus admin intervention." } = req.body;

    if (!["admin", "campus_admin", "student_mod"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only moderators or admins can escalate items." });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint or suggestion not found." });
    }

    complaint.isEscalated = true;
    complaint.escalatedBy = req.user._id;
    complaint.escalatedAt = new Date();
    complaint.escalationReason = reason;
    complaint.priority = "Urgent";
    if (complaint.status === "Pending") {
      complaint.status = "Under Review";
    }

    await complaint.save();

    // Fetch all admins & campus admins
    const admins = await User.find({ role: { $in: ["admin", "campus_admin"] } }).select("_id email name");

    const notifications = admins.map((adminUser) => ({
      recipient: adminUser._id,
      type: "COMPLAINT",
      message: `[URGENT ESCALATION] ${req.user.name} (${req.user.role}) pinged admins regarding ${complaint.type}: "${complaint.title}". Reason: ${reason}`,
      relatedItem: complaint._id,
      onModel: "Complaint",
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    const io = req.app.get("socketio");
    if (io) {
      admins.forEach((adminUser) => {
        io.to(adminUser._id.toString()).emit("admin_escalation_alert", {
          complaintId: complaint._id,
          title: complaint.title,
          escalatedBy: req.user.name,
          reason,
        });
      });
      io.to("mod_room").emit("mod_queue_item_escalated", {
        complaintId: complaint._id,
        escalatedBy: req.user.name,
        reason,
      });
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("submittedBy", "name registeration_number avatar department role")
      .populate("escalatedBy", "name registeration_number avatar role");

    res.status(200).json({
      success: true,
      message: `Admins pinged successfully for this ${complaint.type}. Priority updated to Urgent.`,
      complaint: populatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to ping admins",
      error: error.message,
    });
  }
};

// @desc    Toggle upvote for a suggestion or complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private
export const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint or suggestion not found." });
    }

    const userId = req.user._id;
    const hasUpvoted = complaint.upvotes.includes(userId);

    if (hasUpvoted) {
      complaint.upvotes = complaint.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      complaint.upvotes.push(userId);
    }

    complaint.upvoteCount = complaint.upvotes.length;
    await complaint.save();

    res.status(200).json({
      success: true,
      upvoted: !hasUpvoted,
      upvoteCount: complaint.upvoteCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to toggle upvote",
      error: error.message,
    });
  }
};

// @desc    Delete a suggestion/complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Creator, Admin, Campus Admin)
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint or suggestion not found." });
    }

    const isOwner = complaint.submittedBy.toString() === req.user._id.toString();
    const isAdmin = ["admin", "campus_admin"].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this item." });
    }

    await complaint.deleteOne();

    res.status(200).json({
      success: true,
      message: `${complaint.type === "suggestion" ? "Suggestion" : "Complaint"} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

// @desc    Get complaint analytics and statistics
// @route   GET /api/complaints/stats
// @access  Private (Staff/Mods)
export const getComplaintStats = async (req, res) => {
  try {
    const [
      totalComplaints,
      totalSuggestions,
      pendingCount,
      underReviewCount,
      inProgressCount,
      resolvedCount,
      rejectedCount,
      escalatedCount,
      categoryStats,
    ] = await Promise.all([
      Complaint.countDocuments({ type: "complaint" }),
      Complaint.countDocuments({ type: "suggestion" }),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Under Review" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),
      Complaint.countDocuments({ status: "Rejected" }),
      Complaint.countDocuments({ isEscalated: true }),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        totalSuggestions,
        totalItems: totalComplaints + totalSuggestions,
        pendingCount,
        underReviewCount,
        inProgressCount,
        resolvedCount,
        rejectedCount,
        escalatedCount,
        categories: categoryStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get complaint stats",
      error: error.message,
    });
  }
};
