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
    const { title, description, image, postImage, level, targetGroup, milestone, isFlagged } = req.body;

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

    const imageUrl = image || postImage || "";

    const newPetition = await Petition.create({
      title,
      description,
      image: imageUrl,
      creator: req.user._id,
      level,
      targetGroup: derivedTargetGroup,
      milestone: milestone === null ? null : (milestone || 10),
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
        let room = "mod_room";
        if (level === "Department") {
          room = `mod_room_${derivedTargetGroup}`;
        } else if (level === "Class") {
          room = `mod_room_${req.user.department}`;
        }
        io.to(room).emit("new_petition_pending", {
          message: `New ${level} petition requires approval`,
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

    if (petition.signatures.some(id => id.toString() === req.user._id.toString())) {
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
    if (req.user.role !== 'admin' && req.user.role !== 'student_mod') {
      return res.status(403).json({ message: "Not authorized to moderate" });
    }

    const { action } = req.body; 
    const petition = await Petition.findById(req.params.id).populate('creator', 'name');

    if (!petition) return res.status(404).json({ message: 'Petition not found' });

    const io = req.app.get("socketio");

    if (action === 'Approve') {
      petition.status = 'Active';
      petition.isHidden = false;
      
      petition.moderatedBy = req.user._id;
      
      await petition.save();

      const approvedNotif = await Notification.create({
        recipient: petition.creator._id,
        type: 'PETITION',
        message: `Your petition "${petition.title}" has been approved and is now live!`,
        relatedItem: petition._id,
        onModel: 'Petition'
      });
      if (io) {
        io.to(petition.creator._id.toString()).emit('new_notification', approvedNotif);
        const targetRoom = petition.level === 'Campus' ? 'Campus' : petition.targetGroup;
        io.to(targetRoom).emit('new_petition_published', petition);
      }

      res.status(200).json({ success: true, message: "Petition approved and published." });
    } else if (action === 'Reject') {
      await petition.deleteOne();
      
      const rejectedNotif = await Notification.create({
        recipient: petition.creator._id,
        type: 'GENERAL',
        message: `Your petition "${petition.title}" was rejected by moderation as it violated community guidelines.`
      });
      if (io) {
        io.to(petition.creator._id.toString()).emit('new_notification', rejectedNotif);
      }

      res.status(200).json({ success: true, message: "Petition rejected and deleted." });
    } else {
      res.status(400).json({ message: "Invalid action. Use 'Approve' or 'Reject'." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during moderation", error: error.message });
  }
};

export const reportPetition = async (req, res) => {
  try {
    const { reason } = req.body;
    const petition = await Petition.findById(req.params.id);
    if (!petition) return res.status(404).json({ success: false, message: "Petition not found" });

    if (petition.reportedBy && petition.reportedBy.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: "You have already reported this petition" });
    }

    const reportReason = reason || "Inappropriate petition content";
    if (!petition.reportedBy) petition.reportedBy = [];
    if (!petition.reports) petition.reports = [];
    petition.reportedBy.push(req.user._id);
    petition.reports.push({ user: req.user._id, reason: reportReason });
    petition.isHidden = true;
    await petition.save();

    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_reported_content", {
        message: `A student reported a petition: "${reportReason}"`,
        petitionId: petition._id,
        reason: reportReason,
      });
    }

    return res.status(200).json({ success: true, message: "Petition reported and sent to moderators." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error reporting petition", error: error.message });
  }
};