import User from "../models/User.js"
import Report from "../models/Report.js"
import { checkUserHasPublicActivity } from "../utils/activityCheck.js";

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

    // A user can only see other people's custom images if that user has posted a public post or comment in Forum, Petition, or Career paths
    const targetHasPublicActivity = await checkUserHasPublicActivity(targetUser._id);
    const viewerHasPublicActivity = req.user ? await checkUserHasPublicActivity(req.user._id) : false;
    const canSeeImages = targetHasPublicActivity || viewerHasPublicActivity;

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