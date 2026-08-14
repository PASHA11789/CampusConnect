import React, { useState, useEffect } from "react";
import { toggleBookmark } from "../../services/bookmarkService";

/* ============================================================================
   Reusable bookmark toggle.

   Works on both forum discussions and career posts — pass `type`.

   The click is optimistic: the icon fills immediately, then reverts if the
   request fails. Bookmarking is a low-stakes, high-frequency action, so
   waiting on a round trip before the icon responds feels broken. A failure is
   reported through onError so the host page can show it in its own toast.

   Props
     postId    string    required
     type      "forum" | "career"  defaults to "forum"
     initialSaved  boolean  server-provided starting state
     onToggle  (isSaved: boolean) => void   lets the parent sync its own state
     onError   (message: string) => void    surfaces failures in the page's toast
     size      "sm" | "md"
     showLabel boolean   render a text label beside the icon
     localOnly boolean   toggle without calling the API — used for the seeded
                         demo posts on the Career page, whose ids do not exist
                         in the database
   ========================================================================= */

export default function BookmarkButton({
  postId,
  type = "forum",
  initialSaved = false,
  onToggle,
  onError,
  size = "md",
  showLabel = false,
  localOnly = false,
  className = "",
}) {
  const [isSaved, setIsSaved] = useState(!!initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  // The parent may load its data after this mounts, so track the prop.
  useEffect(() => {
    setIsSaved(!!initialSaved);
  }, [initialSaved]);

  const handleClick = async (e) => {
    // These buttons sit inside clickable cards; without this the card's own
    // onClick fires and navigates away as soon as you bookmark.
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || !postId) return;

    const previous = isSaved;
    setIsSaved(!previous);   // optimistic

    // Demo posts have no row in the database, so there is nothing to call.
    if (localOnly) {
      if (onToggle) onToggle(!previous);
      return;
    }

    setIsLoading(true);

    try {
      const { isSaved: confirmed } = await toggleBookmark(postId, type);
      setIsSaved(confirmed);
      if (onToggle) onToggle(confirmed);
    } catch (err) {
      setIsSaved(previous);  // roll back
      if (onError) onError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const boxSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove bookmark" : "Save to bookmarks"}
      title={isSaved ? "Remove from bookmarks" : "Save to bookmarks"}
      className={`${showLabel ? "px-2.5 h-8 gap-1.5" : boxSize} shrink-0 rounded-full border flex items-center justify-center
        transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
        ${isSaved
          ? "bg-[#00c2cb]/10 border-[#00c2cb] text-[#00c2cb]"
          : "bg-white hover:bg-[#FAF7F0] border-[#E8E1D5] hover:border-[#00c2cb] text-slate-400 hover:text-[#00c2cb]"
        } ${className}`}
    >
      {isLoading ? (
        <span
          className={`${iconSize} border-2 border-current border-t-transparent rounded-full animate-spin`}
          aria-hidden="true"
        />
      ) : (
        <i
          className={`${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark ${iconSize} flex items-center justify-center`}
          aria-hidden="true"
        />

      )}
      {showLabel && (
        <span className="text-[11px] font-extrabold">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </button>
  );
}
