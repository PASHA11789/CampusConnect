import axios from "axios";

/* ============================================================================
   Bookmark API calls, kept in one place so components never build the auth
   header or remember an endpoint path themselves.

   Every call throws on failure with a message safe to show the user, so a
   caller can simply try/catch and surface `err.message` in a toast.
   ========================================================================= */

const authConfig = () => {
  const token = sessionStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Pulls the most useful message out of an axios error: the server's own
// message if it sent one, then the transport error, then a generic fallback.
const toFriendlyError = (error, fallback) => {
  const message =
    error?.response?.data?.message ||
    (error?.code === "ERR_NETWORK" ? "Cannot reach the server. Check your connection." : null) ||
    error?.message ||
    fallback;
  return new Error(message);
};

/**
 * Toggle a bookmark on a forum discussion.
 * @param {string} threadId
 * @returns {Promise<{isSaved: boolean, message: string}>} the new saved state
 */
export const toggleForumBookmark = async (threadId) => {
  try {
    const { data } = await axios.post(`/api/forums/${threadId}/save`, {}, authConfig());
    return { isSaved: !!data.isSaved, message: data.message || "Bookmark updated." };
  } catch (error) {
    throw toFriendlyError(error, "Could not update this bookmark.");
  }
};

/**
 * Toggle a bookmark on a career post. Wraps the endpoint that already existed
 * so both types are called the same way from the UI.
 */
export const toggleCareerBookmark = async (postId) => {
  try {
    const { data } = await axios.post(`/api/careers/${postId}/save`, {}, authConfig());
    return { isSaved: !!data.isSaved, message: data.message || "Bookmark updated." };
  } catch (error) {
    throw toFriendlyError(error, "Could not update this bookmark.");
  }
};

/** Dispatches to the right toggle based on post type. */
export const toggleBookmark = async (postId, type) =>
  type === "career" ? toggleCareerBookmark(postId) : toggleForumBookmark(postId);

/**
 * Fetch every bookmarked post, both types, newest first.
 * @param {"career"|"forum"|undefined} type optional filter
 * @returns {Promise<{bookmarks: Array, counts: {total:number, career:number, forum:number}}>}
 */
export const fetchBookmarks = async (type) => {
  try {
    const query = type && type !== "all" ? `?type=${type}` : "";
    const { data } = await axios.get(`/api/users/bookmarks${query}`, authConfig());
    return {
      bookmarks: data.bookmarks || [],
      counts: data.counts || { total: 0, career: 0, forum: 0 },
    };
  } catch (error) {
    throw toFriendlyError(error, "Could not load your bookmarks.");
  }
};

/** Remove a single bookmark of either type. */
export const removeBookmark = async (postId, type) => {
  try {
    const { data } = await axios.delete(`/api/users/bookmarks/${type}/${postId}`, authConfig());
    return { message: data.message || "Bookmark removed." };
  } catch (error) {
    throw toFriendlyError(error, "Could not remove this bookmark.");
  }
};
