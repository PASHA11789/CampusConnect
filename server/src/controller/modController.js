import Forum from "../models/Forum.js";
import Petition from "../models/Petition.js";
import LostFound from "../models/lostFound.js";
import Notification from "../models/Notification.js";
import CareerThread from "../models/CareerThread.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";

export const getModerationQueue = async (req, res) => {
  try {
    if (req.user.role !== "student_mod" && req.user.role !== "campus_admin") {
      return res.status(403).json({ message: "Access denied. Mod Room is restricted." });
    }

    const results = await Promise.allSettled([
      Forum.find({
        $or: [
          { isHidden: true },
          { "reportedBy.0": { $exists: true } },
          { "replies.isHidden": true },
          { "replies.reportedBy.0": { $exists: true } },
        ],
      })
        .populate("author", "name registeration_number avatar")
        .populate("replies.author", "name registeration_number avatar")
        .populate("reports.user", "name registeration_number avatar")
        .populate("replies.reports.user", "name registeration_number avatar")
        .sort({ updatedAt: -1 }),

      CareerThread.find({
        $or: [
          { isHidden: true },
          { "reportedBy.0": { $exists: true } },
          { "replies.isHidden": true },
          { "replies.reportedBy.0": { $exists: true } },
        ],
      })
        .populate("author", "name registeration_number avatar")
        .populate("replies.author", "name registeration_number avatar")
        .sort({ updatedAt: -1 }),

      Petition.find(
        req.user.role === "student_mod"
          ? {
              $or: [
                { status: "Pending Mod Approval" },
                { isHidden: true, "reportedBy.0": { $exists: true } }
              ],
              $or: [
                { level: "Campus" },
                { level: "Department", targetGroup: req.user.department },
              ],
            }
          : { 
              $or: [
                { status: "Pending Mod Approval" },
                { isHidden: true, "reportedBy.0": { $exists: true } }
              ] 
            }
      )
        .populate("creator", "name registeration_number avatar")
        .sort({ createdAt: 1 }),

      LostFound.find({
        $or: [
          { isHidden: true },
          { "reportedBy.0": { $exists: true } },
        ],
      })
        .populate("reporter", "name registeration_number avatar")
        .sort({ createdAt: -1 }),

      LostFound.find({
        status: { $in: ["Open", "At Office"] },
        createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) }
      })
        .populate("reporter", "name registeration_number avatar")
        .sort({ createdAt: -1 }),

      Report.find({ status: "Pending" })
        .populate("reportedBy", "name registeration_number avatar")
        .populate("targetUser", "name registeration_number avatar email department program semester section role")
        .sort({ createdAt: -1 })
        .then((rawReports) => rawReports.filter((r) => r.targetUser != null)),

      Complaint.find({ status: { $in: ["Pending", "Under Review", "In Progress"] } })
        .populate("submittedBy", "name registeration_number avatar department role")
        .populate("adminResponse.respondedBy", "name avatar role")
        .populate("escalatedBy", "name avatar role")
        .sort({ isEscalated: -1, createdAt: -1 }),
    ]);

    const flaggedForums = results[0].status === "fulfilled" ? results[0].value : [];
    const flaggedCareers = results[1].status === "fulfilled" ? results[1].value : [];
    const pendingPetitions = results[2].status === "fulfilled" ? results[2].value : [];
    const flaggedLostFound = results[3].status === "fulfilled" ? results[3].value : [];
    const oldUnclaimedLostFound = results[4].status === "fulfilled" ? results[4].value : [];
    const profileReports = results[5].status === "fulfilled" ? results[5].value : [];
    const pendingComplaints = results[6].status === "fulfilled" ? results[6].value : [];

    const forumsCount = flaggedForums.length;
    const careersCount = flaggedCareers.length;
    const petitionsCount = pendingPetitions.length;
    const lostFoundCount = flaggedLostFound.length;
    const oldUnclaimedCount = oldUnclaimedLostFound.length;
    const profileReportsCount = profileReports.length;
    const complaintsCount = pendingComplaints.length;

    res.status(200).json({
      success: true,
      counts: {
        forums: forumsCount,
        careers: careersCount,
        petitions: petitionsCount,
        lostFound: lostFoundCount,
        oldUnclaimed: oldUnclaimedCount,
        profileReports: profileReportsCount,
        complaints: complaintsCount,
        total: forumsCount + careersCount + petitionsCount + lostFoundCount + oldUnclaimedCount + profileReportsCount + complaintsCount,
      },
      queue: {
        forums: flaggedForums,
        careers: flaggedCareers,
        petitions: pendingPetitions,
        lostFound: flaggedLostFound,
        oldUnclaimed: oldUnclaimedLostFound,
        profileReports: profileReports,
        complaints: pendingComplaints,
      },
    });
  } catch (error) {
    console.error("Failed to load moderation queue:", error);
    res.status(500).json({
      message: "Failed to load the moderation queue",
      error: safeError(error),
    });
  }
};

export const moderateItem = async (req, res) => {
  try {
    if (req.user.role !== "student_mod" && req.user.role !== "campus_admin") {
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
        petition.reportedBy = [];
        petition.reports = [];
        await petition.save();

        const notif = await Notification.create({
          recipient: petition.creator._id,
          type: "PETITION",
          message: `Your petition "${petition.title}" has been approved and is now live!`,
        });
        if (io) {
          io.to(petition.creator._id.toString()).emit("new_notification", notif);
        }

        const targetRoom = petition.level === "Campus" ? "Campus" : petition.targetGroup;
        io.to(targetRoom).emit("new_petition_published", petition);

        return res.status(200).json({ success: true, message: "Petition approved." });
      } else if (action === "Reject") {
        const deletedId = petition._id;
        await petition.deleteOne();
        const notif = await Notification.create({
          recipient: petition.creator._id,
          type: "GENERAL",
          message: `Your petition "${petition.title}" was rejected and deleted by admin or moderator.`,
        });
        if (io) {
          io.to(petition.creator._id.toString()).emit("new_notification", notif);
          io.emit("petition_deleted", { petitionId: deletedId });
        }
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
        const notif = await Notification.create({
          recipient: thread.author,
          type: "GENERAL",
          message: `Your forum thread "${thread.title}" was removed by moderation.`,
        });
        if (io) {
          io.to(thread.author.toString()).emit("new_notification", notif);
        }
        return res.status(200).json({ success: true, message: "Thread deleted." });
      }
    }

    else if (contentType === "career") {
      const thread = await CareerThread.findById(id);
      if (!thread) return res.status(404).json({ message: "Thread not found" });

      if (action === "Approve") {
        thread.isHidden = false;
        thread.reportedBy = [];
        thread.moderatedBy = req.user._id;
        await thread.save();

        return res.status(200).json({ success: true, message: "Career thread restored." });
      } else if (action === "Reject") {
        await thread.deleteOne();
        const notif = await Notification.create({
          recipient: thread.author,
          type: "GENERAL",
          message: `Your career thread "${thread.title}" was removed by moderation.`,
        });
        if (io) {
          io.to(thread.author.toString()).emit("new_notification", notif);
        }
        return res.status(200).json({ success: true, message: "Career thread deleted." });
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
        const notif = await Notification.create({
          recipient: replyAuthor,
          type: "GENERAL",
          message: "One of your forum replies was removed by moderation.",
        });
        if (io) {
          io.to(replyAuthor.toString()).emit("new_notification", notif);
        }
        return res.status(200).json({ success: true, message: "Reply deleted." });
      }
    }

    else if (contentType === "career_reply") {
      if (!threadId) {
        return res.status(400).json({ message: "threadId is required to moderate a reply" });
      }
      const thread = await CareerThread.findById(threadId);
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
        const notif = await Notification.create({
          recipient: replyAuthor,
          type: "GENERAL",
          message: "One of your career path replies was removed by moderation.",
        });
        if (io) {
          io.to(replyAuthor.toString()).emit("new_notification", notif);
        }
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
        const notif = await Notification.create({
          recipient: item.reporter._id,
          type: "GENERAL",
          message: `Your Lost & Found report for "${item.itemName}" was rejected by moderation.`,
        });
        if (io) {
          io.to(item.reporter._id.toString()).emit("new_notification", notif);
        }
        return res.status(200).json({ success: true, message: "Item rejected and deleted." });
      }
    }

    else if (contentType === "report" || contentType === "profile_report") {
      const report = await Report.findById(id).populate("targetUser");
      if (!report) return res.status(404).json({ message: "Report not found" });

      if (action === "Approve") {
        report.status = "Resolved";
        await report.save();

        if (report.targetUser) {
          // Reset avatar to fallback if reported for explicit picture
          report.targetUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(report.targetUser.name)}&background=random`;
          await report.targetUser.save();

          const notif = await Notification.create({
            recipient: report.targetUser._id,
            type: "GENERAL",
            message: "Your profile image/content was flagged and removed due to a community policy violation.",
          });
          if (io) {
            io.to(report.targetUser._id.toString()).emit("new_notification", notif);
          }
        }

        return res.status(200).json({ success: true, message: "Profile report resolved and offending content removed." });
      } else if (action === "Reject") {
        report.status = "Dismissed";
        await report.save();
        return res.status(200).json({ success: true, message: "Profile report dismissed." });
      }
    } else if (contentType === "complaint") {
      const complaint = await Complaint.findById(id);
      if (!complaint) return res.status(404).json({ message: "Complaint or suggestion not found" });

      if (action === "Approve") {
        complaint.status = "Resolved";
        complaint.adminResponse = {
          response: req.body.response || "Resolved by moderator.",
          respondedBy: req.user._id,
          respondedAt: new Date(),
        };
        await complaint.save();

        const notif = await Notification.create({
          recipient: complaint.submittedBy,
          type: "COMPLAINT",
          message: `Your ${complaint.type} "${complaint.title}" has been marked as Resolved by moderation.`,
          relatedItem: complaint._id,
          onModel: "Complaint",
        });
        if (io) {
          io.to(complaint.submittedBy.toString()).emit("new_notification", notif);
        }

        return res.status(200).json({ success: true, message: "Complaint resolved.", complaint });
      } else if (action === "Reject") {
        complaint.status = "Rejected";
        complaint.adminResponse = {
          response: req.body.response || "Rejected by moderator.",
          respondedBy: req.user._id,
          respondedAt: new Date(),
        };
        await complaint.save();

        const notif = await Notification.create({
          recipient: complaint.submittedBy,
          type: "COMPLAINT",
          message: `Your ${complaint.type} "${complaint.title}" was reviewed and marked as Rejected.`,
          relatedItem: complaint._id,
          onModel: "Complaint",
        });
        if (io) {
          io.to(complaint.submittedBy.toString()).emit("new_notification", notif);
        }

        return res.status(200).json({ success: true, message: "Complaint rejected.", complaint });
      }
    } else {
      return res.status(400).json({ message: "Invalid content type." });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error during moderation action",
      error: safeError(error),
    });
  }
};