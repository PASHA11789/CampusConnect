import Forum from "../models/Forum.js"
import Petition from "../models/Petition.js"


export const getModerationQueue = async (req, res) => {
    try {
        if (req.user.role !== "admin" && req.user.role !== "student_mod") {
            return res.status(403).json({ message: "Access denied. Mod Room is restricted." })
        }
        
        const flaggedForums = await Forum.find({
            $or: [
                { isHidden: true },
                { "reportedBy.0": { $exists: true } },
                { "replies.isHidden": true },
                { "replies.reportedBy.0": { $exists: true } }
            ]
        }).populate("author", "name registeration_number avatar")
          .populate("replies.author", "name registeration_number avatar")
          .sort({ updatedAt: -1 })
          
        let petitionQuery = { status: "Pending Mod Approval" };
        if (req.user.role === "student_mod") {
            petitionQuery.$or = [
                { level: "Campus" },
                { level: "Department", targetGroup: req.user.department }
            ];
        }

        const pendingPetitions = await Petition.find(petitionQuery)
            .populate("creator", "name registeration_number avatar")
            .sort({ creator: -1 })
        
        res.status(200).json({
            success: true,
            counts: {
                forums: flaggedForums.length,
                petitions: pendingPetitions.length,
                total: flaggedForums.length + pendingPetitions.length
            },
            queue: {
                forums: flaggedForums,
                petitions: pendingPetitions
            }
        })
    } catch (error) {
        res.status(500).json({ message: "Failed to load the moderation queue", error: error.message })
    }
}