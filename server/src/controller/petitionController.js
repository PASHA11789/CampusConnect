import Petition from "../models/Petition.js";
import Notification from "../models/Notification.js";

export const getPetitions = async (req, res) => {
  try {
    const classString = `${req.user.program}-${req.user.department}-${req.user.semester}-${req.user.section}`;
    let queryObj = {};

    if (req.user.role === "student") {
      queryObj = {
        status: { $in: ["Active", "Under Review", "Resolved", "Closed"] },
        isHidden: false,
        $or: [
          { level: "Campus" },
          { level: "Department", targetGroup: req.user.department },
          { level: "Class", targetGroup: classString },
          { creator: req.user._id },
        ],
      };
    } else {
      queryObj = {};
    }

    const petitions = await Petition.find(queryObj)
      .sort({ createdAt: -1 })
      .populate("creator", "name avatar registeration_number");

    return res.status(200).json({ success: true, count: petitions.length, petitions });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch petitions", error: error.message });
  }
};

export const createPetition = async (req, res) => {
  try {
    const { title, description, level, targetGroup, milestone, isFlagged } = req.body;

    if (!title || !description || !level) {
      return res.status(400).json({ success: false, message: "Missing required petition fields (title, description, level)" });
    }

    let derivedTargetGroup = targetGroup;
    if (!derivedTargetGroup) {
      if (level === "Class") {
        derivedTargetGroup = `${req.user.program}-${req.user.department}-${req.user.semester}-${req.user.section}`;
      } else if (level === "Department") {
        derivedTargetGroup = req.user.department;
      } else {
        derivedTargetGroup = "Campus";
      }
    }

    let initialStatus = "Active";
    if (isFlagged || level === "Department" || level === "Campus") {
      initialStatus = "Pending Mod Approval";
    }

    const newPetition = await Petition.create({
      title,
      description,
      creator: req.user._id,
      level,
      targetGroup: derivedTargetGroup,
      milestone: milestone || 10,
      status: initialStatus,
      isHidden: isFlagged || false,
    });

    const populatedPetition = await Petition.findById(newPetition._id)
      .populate("creator", "name avatar registeration_number");

    const io = req.app.get("socketio");

    if (isFlagged) {
      const warningNotification = await Notification.create({
        recipient: req.user._id,
        type: "GENERAL",
        message: "Your petition is under review by moderators due to flagged keywords.",
      });

      if (io) {
        io.to(req.user._id.toString()).emit("new_notification", warningNotification);
        io.to("mod_room").emit("new_flagged_content", {
          message: "AI flagged a new petition",
          petitionId: newPetition._id,
        });
      }

      return res.status(202).json({
        success: true,
        message: "Petition sent for safety review due to inappropriate content.",
        underReview: true,
      });
    }

    if (initialStatus === "Pending Mod Approval") {
      if (io) {
        io.to("mod_room").emit("new_petition_pending", {
          message: "New petition requires approval",
          petitionId: newPetition._id,
        });
      }
      return res.status(201).json({
        success: true,
        message: "Petition submitted and awaiting student moderator approval.",
        petition: populatedPetition,
      });
    }

    if (io) {
      io.to(derivedTargetGroup).emit("new_petition_published", populatedPetition);
    }

    return res.status(201).json({
      success: true,
      message: "Class petition published instantly!",
      petition: populatedPetition,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create petition", error: error.message });
  }
};

export const signPetition = async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    if (!petition) {
      return res.status(404).json({ success: false, message: "Petition not found" });
    }

    if (petition.status !== "Active") {
      return res.status(400).json({ success: false, message: `Cannot sign a petition that is ${petition.status}` });
    }

    if (petition.signatures.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You have already signed this petition" });
    }

    petition.signatures.push(req.user._id);

    const io = req.app.get("socketio");

    if (petition.milestone && petition.signatures.length >= petition.milestone) {
      petition.status = "Under Review";

      const milestoneNotif = await Notification.create({
        recipient: petition.creator,
        type: "PETITION",
        message: `Congratulations! Your petition "${petition.title}" reached its goal and is now under administrative review.`,
        relatedItem: petition._id,
        onModel: "Petition",
      });

      if (io) {
        io.to(petition.creator.toString()).emit("new_notification", milestoneNotif);
        io.to("mod_room").emit("petition_milestone_reached", {
          petitionId: petition._id,
          title: petition.title,
        });
      }
    }

    await petition.save();

    if (io) {
      io.emit("petition_signed", {
        petitionId: petition._id,
        currentSignatures: petition.signatures.length,
        status: petition.status,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Petition signed successfully!",
      currentSignatures: petition.signatures.length,
      status: petition.status,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error signing petition", error: error.message });
  }
};

export const moderatePetition = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "student_mod") {
      return res.status(403).json({ success: false, message: "Not authorized to moderate" });
    }

    const { action } = req.body;
    const petition = await Petition.findById(req.params.id).populate("creator", "name");

    if (!petition) {
      return res.status(404).json({ success: false, message: "Petition not found" });
    }

    const io = req.app.get("socketio");
    const actionNormalized = action?.toLowerCase();

    if (actionNormalized === "approved" || actionNormalized === "approve") {
      petition.status = "Active";
      petition.isHidden = false;
      await petition.save();

      const approvedNotif = await Notification.create({
        recipient: petition.creator._id,
        type: "PETITION",
        message: `Your petition "${petition.title}" has been approved and is now live!`,
        relatedItem: petition._id,
        onModel: "Petition",
      });

      if (io) {
        io.to(petition.creator._id.toString()).emit("new_notification", approvedNotif);
        const targetRoom = petition.level === "Campus" ? "Campus" : petition.targetGroup;
        io.to(targetRoom).emit("new_petition_published", petition);
      }

      return res.status(200).json({ success: true, message: "Petition approved and published" });
    } else if (actionNormalized === "rejected" || actionNormalized === "reject") {
      const creatorId = petition.creator._id;
      const petitionTitle = petition.title;

      await petition.deleteOne();

      const rejectedNotif = await Notification.create({
        recipient: creatorId,
        type: "GENERAL",
        message: `Your petition "${petitionTitle}" was rejected by moderation as it violated community guidelines.`,
      });

      if (io) {
        io.to(creatorId.toString()).emit("new_notification", rejectedNotif);
      }

      return res.status(200).json({ success: true, message: "Petition was rejected and deleted" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'Approve' or 'Reject'." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during moderation", error: error.message });
  }
};