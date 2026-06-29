import Forum from "../models/Forum.js";
import Petition from "../models/Petition.js";
import LostFound from "../models/lostFound.js";
import Notification from "../models/Notification.js";

export const getModerationQueue = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "student_mod" && req.user.role !== "campus_admin") {
      return res.status(403).json({ message: "Access denied. Mod Room is restricted." });
    }

    const flaggedForums = await Forum.find({
      $or: [
        { isHidden: true },
        { "reportedBy.0": { $exists: true } },
        { "replies.isHidden": true },
        { "replies.reportedBy.0": { $exists: true } },
      ],
    })
      .populate("author", "name registeration_number avatar")
      .populate("replies.author", "name registeration_number avatar")
      .sort({ updatedAt: -1 });

    let petitionQuery = { status: "Pending Mod Approval" };
    if (req.user.role === "student_mod") {
      petitionQuery.$or = [
        { level: "Campus" },
        { level: "Department", targetGroup: req.user.department },
      ];
    }

    const pendingPetitions = await Petition.find(petitionQuery)
      .populate("creator", "name registeration_number avatar")
      .sort({ createdAt: 1 });

    const flaggedLostFound = await LostFound.find({
      $or: [
        { isHidden: true },
        { "reportedBy.0": { $exists: true } },
      ],
    })
      .populate("reporter", "name registeration_number avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      counts: {
        forums: flaggedForums.length,
        petitions: pendingPetitions.length,
        lostFound: flaggedLostFound.length,
        total: flaggedForums.length + pendingPetitions.length + flaggedLostFound.length,
      },
      queue: {
        forums: flaggedForums,
        petitions: pendingPetitions,
        lostFound: flaggedLostFound,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load the moderation queue",
      error: error.message,
    });
  }
};

export const moderateItem = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "student_mod" && req.user.role !== "campus_admin") {
      return res.status(403).json({ message: "Not authorized to moderate" });
    }

    const { contentType, id } = req.params;
    const { action, threadId } = req.body;

    if (!action || (action !== "Approve" && action !== "Reject")) {
      return res.status(400).json({ message: "Invalid action. Must be 'Approve' or 'Reject'." });
    }

    const io = req.app.get("socketio");

    if (contentType === "petition") {
      const petition = await Petition.findById(id).populate("creator", "name registeration_number avatar");
      if (!petition) return res.status(404).json({ message: "Petition not found" });

      if (action === "Approve") {
        petition.status = "Active";
        petition.isHidden = false;
        petition.moderatedBy = req.user._id;
        await petition.save();

        await Notification.create({
          recipient: petition.creator._id,
          type: "PETITION",
          message: `Your petition "${petition.title}" has been approved and is now live!`,
        });

        const targetRoom = petition.level === "Campus" ? "Campus" : petition.targetGroup;
        io.to(targetRoom).emit("new_petition_published", petition);

        return res.status(200).json({ success: true, message: "Petition approved." });
      } else if (action === "Reject") {
        await petition.deleteOne();
        await Notification.create({
          recipient: petition.creator._id,
          type: "GENERAL",
          message: `Your petition "${petition.title}" was rejected by moderation.`,
        });
        return res.status(200).json({ success: true, message: "Petition rejected." });
      }
    }

    else if (contentType === "forum") {
      const thread = await Forum.findById(id);
      if (!thread) return res.status(404).json({ message: "Thread not found" });

      if (action === "Approve") {
        thread.isHidden = false;
        thread.reportedBy = [];
        thread.moderatedBy = req.user._id;
        await thread.save();

        io.emit("thread_moderated", {
          threadId: thread._id,
          isHidden: false,
          moderatedBy: req.user.name,
        });
        return res.status(200).json({ success: true, message: "Thread restored to public." });
      } else if (action === "Reject") {
        await thread.deleteOne();
        await Notification.create({
          recipient: thread.author,
          type: "GENERAL",
          message: `Your forum thread "${thread.title}" was removed by moderation.`,
        });
        return res.status(200).json({ success: true, message: "Thread deleted." });
      }
    }

    else if (contentType === "reply") {
      if (!threadId) {
        return res.status(400).json({ message: "threadId is required to moderate a reply" });
      }
      const thread = await Forum.findById(threadId);
      if (!thread) return res.status(404).json({ message: "Thread not found" });

      const reply = thread.replies.id(id);
      if (!reply) return res.status(404).json({ message: "Reply not found" });

      if (action === "Approve") {
        reply.isHidden = false;
        reply.reportedBy = [];
        reply.moderatedBy = req.user._id;
        await thread.save();
        return res.status(200).json({ success: true, message: "Reply restored." });
      } else if (action === "Reject") {
        const replyAuthor = reply.author;
        reply.deleteOne();
        await thread.save();
        await Notification.create({
          recipient: replyAuthor,
          type: "GENERAL",
          message: "One of your forum replies was removed by moderation.",
        });
        return res.status(200).json({ success: true, message: "Reply deleted." });
      }
    }

    else if (contentType === "lostfound") {
      const item = await LostFound.findById(id).populate("reporter", "name registeration_number avatar");
      if (!item) return res.status(404).json({ message: "Item not found" });

      if (action === "Approve") {
        item.isHidden = false;
        item.reportedBy = [];
        item.moderatedBy = req.user._id;
        await item.save();

        io.emit("new_lost_found_item", item);
        return res.status(200).json({ success: true, message: "Lost & Found item approved." });
      } else if (action === "Reject") {
        await item.deleteOne();
        await Notification.create({
          recipient: item.reporter._id,
          type: "GENERAL",
          message: `Your Lost & Found report for "${item.itemName}" was rejected by moderation.`,
        });
        return res.status(200).json({ success: true, message: "Item rejected and deleted." });
      }
    } else {
      return res.status(400).json({ message: "Invalid content type." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error during moderation action",
      error: error.message,
    });
  }
};