import Forum from "../models/Forum.js";
import Petition from "../models/Petition.js";
import CareerThread from "../models/CareerThread.js";

/**
 * Checks whether a given user has made at least one public post or comment/reply
 * in Forum discussions, Petitions, or Career paths.
 */
export const checkUserHasPublicActivity = async (userId) => {
  if (!userId) return false;

  try {
    const [hasForumThread, hasForumReply, hasPetition, hasCareerThread, hasCareerReply] = await Promise.all([
      Forum.exists({ author: userId, isHidden: false }),
      Forum.exists({ "replies.author": userId, "replies.isHidden": false }),
      Petition.exists({ creator: userId, isHidden: false }),
      CareerThread.exists({ author: userId, isHidden: false }),
      CareerThread.exists({ "replies.author": userId, "replies.isHidden": false }),
    ]);

    return !!(hasForumThread || hasForumReply || hasPetition || hasCareerThread || hasCareerReply);
  } catch (error) {
    console.error("Error checking user public activity:", error);
    return false;
  }
};
