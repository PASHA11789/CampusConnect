import Forum from "../models/Forum.js";
import Petition from "../models/Petition.js";
import LostFound from "../models/lostFound.js";
import Notification from "../models/Notification.js";
import CareerThread from "../models/CareerThread.js";

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";

export const getDashboardSummary = async (req, res) => {
  try {
    const classString = req.user ? `${req.user.program}-${req.user.department}-${req.user.semester}-${req.user.section}` : "";
    let petitionQuery = { status: "Active", isHidden: false };
    if (req.user && req.user.role !== "admin" && req.user.role !== "campus_admin") {
      petitionQuery.$or = [
        { level: "Campus" },
        { level: "Department", targetGroup: req.user.department },
        { level: "Class", targetGroup: classString },
        { creator: req.user._id },
      ];
    }

    const [recentForums, activePetitionsRaw, recentLostFound, unreadNotifications, recentCareers] =
      await Promise.all([
        Forum.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("author", "registeration_number avatar")
          .select("title repliesCount createdAt author"),
        Petition.find(petitionQuery)
          .sort({ createdAt: -1 })
          .select("title description level targetGroup signatures status milestone createdAt"),
        LostFound.find({ status: "Open" })
          .sort({ createdAt: -1 })
          .limit(3)
          .select("type itemName location createdAt status"),
        Notification.find({ recipient: req.user._id, isRead: false }).select(
          "type",
        ),
        CareerThread.find({ isFlagged: false, isActive: true })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate("author", "name avatar role registeration_number")
          .select("title category replies createdAt author"),
      ]);

    // Sort active petitions so Class-level petitions are positioned ON TOP
    const activePetitions = [...activePetitionsRaw].sort((a, b) => {
      const order = { Class: 1, Department: 2, Campus: 3 };
      const weightA = order[a.level] || 4;
      const weightB = order[b.level] || 4;
      if (weightA !== weightB) return weightA - weightB;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).slice(0, 5);
    const notificationCounts = {
      forums: unreadNotifications.filter((n) => n.type === "FORUM").length,
      petitions: unreadNotifications.filter((n) => n.type === "PETITION")
        .length,
      updates: unreadNotifications.filter(
        (n) => n.type === "ANNOUNCEMENT" || n.type === "GENERAL",
      ).length,
    };

    res.status(200).json({
      notifications: notificationCounts,
      forums: recentForums,
      petitions: activePetitions,
      lostAndFound: recentLostFound,
      careers: recentCareers,

      busRoutes: [
        { route: "Route A", status: "On Time", time: "5m" },
        { route: "Route B", status: "Delayed", time: "12m" },
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to assemble dashboard data payload",
      error: safeError(error),
    });
  }
};
