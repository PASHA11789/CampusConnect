import User from "../models/User.js"
import Report from "../models/Report.js"
import { checkUserHasPublicActivity } from "../utils/activityCheck.js";
import { sendWebPushNotification } from "../utils/pushNotification.js";


export const updateProfile = async (req, res) =>{
    try{
        const {name, isNameHidden, avatar} = req.body
        const user = await User.findById(req.user._id)
        if(!user){
            return res.status(404).json({message:"User not found"}) 
        }
        if (name) user.name = name
        if (isNameHidden !== undefined) user.isNameHidden = isNameHidden
        if (avatar) user.avatar = avatar

        const updatedUser = await user.save()
        res.status(200).json({
            success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        isNameHidden: updatedUser.isNameHidden,
        registeration_number: updatedUser.registeration_number,
        registrationNumber: updatedUser.registeration_number
        }
      })
    }catch(error){res.status(500).json({ message: "Error updating profile", error: error.message })}
}

export const getPublicProfile = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const displayIdentity = targetUser.isNameHidden 
      ? `Student ${targetUser.registeration_number}` 
      : targetUser.name;

    // A user can only see other people's custom images if that user has posted a public post or comment in Forum, Petition, or Career paths (Mods/Admins can always see them)
    const isStaffOrMod = req.user && (req.user.role === 'admin' || req.user.role === 'campus_admin' || req.user.role === 'student_mod');
    const targetHasPublicActivity = await checkUserHasPublicActivity(targetUser._id);
    const viewerHasPublicActivity = req.user ? await checkUserHasPublicActivity(req.user._id) : false;
    const canSeeImages = isStaffOrMod || targetHasPublicActivity || viewerHasPublicActivity;

    const safeAvatar = canSeeImages 
      ? targetUser.avatar 
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayIdentity)}&background=random`;

    const safeImages = canSeeImages ? (targetUser.images || []) : [];

    res.status(200).json({
      success: true,
      profile: {
        _id: targetUser._id,
        displayName: displayIdentity,
        avatar: safeAvatar,
        role: targetUser.role,
        images: safeImages,
        canSeeImages,
        hasPublicActivity: targetHasPublicActivity,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

export const reportUserProfile = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const reporterId = req.user._id;
    const { reason, details } = req.body; 

    if (targetUserId === reporterId.toString()) {
      return res.status(400).json({ message: "Cannot report your own profile" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const reportReason = reason || "Inappropriate Name or Profile Image";
    const reportDetails = details || "Explicit or inappropriate profile content reported.";

    const newReport = await Report.create({
      reportedBy: reporterId,
      targetUser: targetUserId,
      type: 'Profile_Violation',
      reason: reportReason,
      details: reportDetails,
      status: 'Pending'
    });

    const io = req.app.get("socketio");
    if (io) {
      io.to("mod_room").emit("new_reported_content", {
        message: `User Profile Reported: "${reportReason}"`,
        reportId: newReport._id,
        targetUserId,
        reason: reportReason,
        details: reportDetails,
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Profile successfully reported to the Joint Office Mod Room.",
      reportId: newReport._id
    });

  } catch (error) {
    res.status(500).json({ message: "Error reporting user profile", error: error.message });
  }
};

export const subscribePushNotification = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ message: "Subscription object is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.pushSubscription = subscription;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Push subscription saved successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to save push subscription", error: error.message });
  }
};

// @desc    Issue a disciplinary warning & sanitize profile
// @route   POST /api/users/:userId/warn
// @access  Mod / Admin
export const warnUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'campus_admin' && req.user.role !== 'student_mod' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: "Not authorized to issue warnings" });
    }

    const { reason, details, sanitizeAvatar } = req.body;
    const targetUserId = req.params.id || req.params.userId;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (sanitizeAvatar) {
      targetUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}&background=071A35&color=00c2cb`;
    }

    targetUser.activeWarning = {
      hasWarning: true,
      reason: reason || "Violation of Campus Guidelines",
      details: details || "Your profile content/behavior was flagged as inappropriate by campus administration.",
      issuedAt: new Date(),
      issuedBy: req.user._id,
      acknowledged: false
    };

    await targetUser.save();

    const io = req.app.get("socketio");
    if (io) {
      io.emit(`user_warned_${targetUser._id}`, targetUser.activeWarning);
    }

    res.json({ success: true, message: `Warning issued to ${targetUser.name}.`, user: targetUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to issue warning", error: error.message });
  }
};

// @desc    Acknowledge active warning
// @route   PUT /api/users/acknowledge-warning
// @access  Protected
export const acknowledgeWarning = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user && user.activeWarning) {
      user.activeWarning.acknowledged = true;
      user.activeWarning.hasWarning = false;
      await user.save();
    }
    res.json({ success: true, message: "Warning acknowledged." });
  } catch (error) {
    res.status(500).json({ message: "Failed to acknowledge warning", error: error.message });
  }
};

// @desc    Return the VAPID public key (public — no auth needed)
// @route   GET /api/users/vapid-public-key
// @access  Public
export const getVapidPublicKey = (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(503).json({ message: "Push notifications are not configured on this server." });
  }
  res.json({ vapidPublicKey: key });
};

// @desc    Send a test push notification to the currently logged-in user
// @route   POST /api/users/test-push
// @access  Protected
export const testPushNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("pushSubscription name");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!user.pushSubscription) {
      return res.status(400).json({
        message: "No push subscription found for this user. Make sure you allowed notifications in the browser and that the subscription was saved."
      });
    }
    const success = await sendWebPushNotification(user.pushSubscription, {
      title: "CampusConnect Test 🔔",
      body: `Hello ${user.name}! Push notifications are working correctly.`,
      url: "/dashboard"
    });
    if (success) {
      res.json({ success: true, message: "Test push notification sent! Check your browser/OS notifications." });
    } else {
      res.status(500).json({ success: false, message: "Failed to send push notification. Check server logs." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sending test push", error: error.message });
  }
};
