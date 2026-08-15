import User from "../models/User.js";
import CareerThread from "../models/CareerThread.js";
import Forum from "../models/Forum.js";

/* ============================================================================
   Unified bookmarks.

   SCHEMA DECISION
   Bookmarks are stored as two ObjectId arrays on the User document —
   `savedCareerPosts` (already existed) and `savedForumPosts` (added for this
   feature) — rather than in a dedicated Bookmark collection.

   Why: the career bookmark feature already worked this way and several places
   in careerController read `user.savedCareerPosts` directly. Introducing a
   second, different mechanism for forum posts would leave the codebase with
   two ways to answer the same question. Per-user bookmark counts are small, so
   array growth is not a practical concern.

   What this costs: an ObjectId array records *what* was saved but not *when*.
   The unified feed below therefore sorts by when each post was created, not by
   when the user bookmarked it.

   When to migrate to a `Bookmark` collection ({ user, post, postType, savedAt }):
     - you want "recently saved first" ordering, or
     - you want to bookmark a third content type (petitions, lost & found), or
     - you need to ask "who bookmarked this post?".
   At that point the two arrays become a one-off migration script, and this
   controller is the only read path that has to change.
   ========================================================================= */

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";

// Both post types are flattened into one shape so the client renders a single
// list without branching on type for every field. `type` is preserved so the
// UI can badge each card and route a click to the right page.
const normaliseCareerThread = (thread) => ({
  _id: thread._id,
  type: "career",
  title: thread.title,
  content: thread.content,
  image: thread.companyLogo || "",
  author: thread.author,
  createdAt: thread.createdAt,
  category: thread.category || "General",
  tags: [],
  repliesCount: Array.isArray(thread.replies) ? thread.replies.length : 0,
  likesCount: typeof thread.likesCount === "number" ? thread.likesCount : 0,
  company: thread.company || "",
  location: thread.location || "",
  jobType: thread.jobType || "",
});

const normaliseForumThread = (thread) => ({
  _id: thread._id,
  type: "forum",
  title: thread.title,
  content: thread.content,
  image: thread.image || "",
  author: thread.author,
  createdAt: thread.createdAt,
  category: "Discussion",
  tags: Array.isArray(thread.tags) ? thread.tags : [],
  repliesCount:
    typeof thread.repliesCount === "number"
      ? thread.repliesCount
      : Array.isArray(thread.replies)
        ? thread.replies.length
        : 0,
  likesCount: 0,
  company: "",
  location: "",
  jobType: "",
});

// Authors who have chosen to hide their name are shown by registration number,
// matching the behaviour of formatSafeThread in careerController.
const applyAuthorAnonymity = (post) => {
  if (post.author && post.author.isNameHidden) {
    post.author = {
      ...post.author,
      name: `Student ${post.author.registeration_number}`,
    };
  }
  return post;
};

const AUTHOR_FIELDS = "name avatar role isNameHidden registeration_number department program";

// GET /api/users/bookmarks — every saved post, both types, newest first.
// Optional ?type=career|forum narrows the response to one kind.
export const getAllBookmarks = async (req, res) => {
  try {
    const { type } = req.query;

    const user = await User.findById(req.user._id)
      .select("savedCareerPosts savedForumPosts")
      .populate({
        path: "savedCareerPosts",
        populate: { path: "author", select: AUTHOR_FIELDS },
      })
      .populate({
        path: "savedForumPosts",
        populate: { path: "author", select: AUTHOR_FIELDS },
      })
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // A populated entry is null when the underlying post was deleted after
    // being bookmarked. Those are dropped rather than returned as empty cards.
    const careerPosts = (user.savedCareerPosts || [])
      .filter(Boolean)
      .filter((t) => !t.isHidden)
      .map(normaliseCareerThread)
      .map(applyAuthorAnonymity);

    const forumPosts = (user.savedForumPosts || [])
      .filter(Boolean)
      .filter((t) => !t.isHidden)
      .map(normaliseForumThread)
      .map(applyAuthorAnonymity);

    let bookmarks;
    if (type === "career") bookmarks = careerPosts;
    else if (type === "forum") bookmarks = forumPosts;
    else bookmarks = [...careerPosts, ...forumPosts];

    // Newest post first. See the note at the top of this file on why this is
    // post creation date and not bookmark date.
    bookmarks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      counts: {
        total: careerPosts.length + forumPosts.length,
        career: careerPosts.length,
        forum: forumPosts.length,
      },
      bookmarks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load bookmarks",
      error: safeError(error),
    });
  }
};

// DELETE /api/users/bookmarks/:type/:id — remove one bookmark of either type.
// Lets the bookmarks page remove an item without knowing which module's toggle
// endpoint to call.
export const removeBookmark = async (req, res) => {
  try {
    const { type, id } = req.params;

    const field =
      type === "career" ? "savedCareerPosts" : type === "forum" ? "savedForumPosts" : null;

    if (!field) {
      return res.status(400).json({
        success: false,
        message: "Bookmark type must be either 'career' or 'forum'.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const before = (user[field] || []).length;
    user[field] = (user[field] || []).filter((postId) => postId.toString() !== id.toString());

    if (user[field].length === before) {
      return res.status(404).json({ success: false, message: "Bookmark not found" });
    }

    await user.save();

    res.status(200).json({ success: true, message: "Bookmark removed.", isSaved: false });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove bookmark",
      error: safeError(error),
    });
  }
};
