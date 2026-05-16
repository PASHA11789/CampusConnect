import Forum from "../models/Forum.js";
import Petition from "../models/Petition.js";
import LostFound from "../models/lostFound.js";
import Notification from "../models/Notification.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const [recentForums, activePetitions, recentLostFound, unreadNotications] =
      await Promise.all([
        Forum.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select("title repliesCount"),
        Petition.find({ status: "Active" })
          .sort({ createdAt: -1 })
          .limit(3)
          .select("title currntSignatures targetSignatures"),
        LostFound.find({ status: "Open" })
          .sort({ createdAt: -1 })
          .limit(3)
          .select("type itemName location"),
        Notification.find({ recipient: req.user._id, isRead: false }).select(
          "type",
        ),
      ]);
    const notificationCounts = {
      forums: unreadNotifications.filter((n) => n.type === "FORUM").length,
      petitions: unreadNotifications.filter((n) => n.type === "PETITION")
        .length,
      upadates: unreadNotifications.filter(
        (n) => n.type === "Annoucement" || n.type === "GENERAL",
      ).length,
    };

    res.status(200).json({
      notifications: notificationCounts,
      forums: recentForums,
      petitions: activePetitions,
      lostAndFound: recentLostFound,

      busRoutes: [
        { route: "Route A", status: "On Time", time: "5m" },
        { route: "Route B", status: "Delayed", time: "12m" },
      ],
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to assemble dashboard data payload",
      error: error.message,
    });
  }
};
