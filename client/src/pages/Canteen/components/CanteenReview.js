import React from "react";

export default function CanteenReview({
  reviews,
  newReviewName,
  newReviewComment,
  setNewReviewComment,
  newReviewRating,
  setNewReviewRating,
  handlePostReview,
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
      <div className="mb-5">
        <h2 className="text-lg font-black text-[#0a2342]">Community Reviews</h2>
        <p className="text-xs font-semibold text-slate-400">
          Students feedback about campus food
        </p>
      </div>

      <form onSubmit={handlePostReview} className="mb-6 rounded-3xl bg-[#fff7f2] p-4">
        <div className="grid grid-cols-[1fr_120px] gap-3 max-md:grid-cols-1">
          <input
            value={newReviewName}
            disabled
            className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-bold text-slate-500"
          />

          <select
            value={newReviewRating}
            onChange={(e) => setNewReviewRating(Number(e.target.value))}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-bold outline-none"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                ⭐ {r}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={newReviewComment}
          onChange={(e) => setNewReviewComment(e.target.value)}
          placeholder="Write your review..."
          className="mt-3 min-h-[90px] w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-xs font-semibold outline-none"
        />

        <button className="mt-3 rounded-2xl bg-[#e2725b] px-5 py-3 text-xs font-black text-white">
          Post Review
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {reviews.map((review, index) => (
          <div key={index} className="rounded-3xl border border-slate-100 bg-[#fffaf7] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0a2342]">{review.name}</h3>
              <span className="text-xs font-black text-amber-500">⭐ {review.rating}</span>
            </div>
            <p className="mt-3 text-xs font-medium leading-relaxed text-slate-500">
              “{review.comment}”
            </p>
            <p className="mt-3 text-[10px] font-bold text-slate-400">{review.date}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
