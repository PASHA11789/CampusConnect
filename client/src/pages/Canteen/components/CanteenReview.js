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
    <section className="rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.015)] border border-slate-200/80">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-0.5">
        <h2 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide">
          Community Reviews
        </h2>
        <p className="text-[10px] font-bold text-slate-400">
          Student feedback about campus food
        </p>
      </div>

      {/* Review Posting Form */}
      <form
        onSubmit={handlePostReview}
        className="mb-6 rounded-[24px] bg-slate-50 border border-slate-100 p-5 flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-3">
          <input
            value={newReviewName}
            disabled
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-400 shadow-sm cursor-not-allowed outline-none"
          />

          <select
            value={newReviewRating}
            onChange={(e) => setNewReviewRating(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-[#0a2342] outline-none shadow-sm focus:border-[#e87a5d] cursor-pointer transition-colors"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                ⭐ {r} Stars
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={newReviewComment}
          onChange={(e) => setNewReviewComment(e.target.value)}
          placeholder="Write your review about the canteen menu, taste, or delivery..."
          rows="3"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold outline-none focus:border-[#e87a5d] transition-all placeholder-slate-400 resize-none shadow-sm"
        />

        <button
          type="submit"
          className="rounded-xl bg-[#0a2342] hover:bg-[#e87a5d] text-white border-none px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-colors duration-200 shadow-sm cursor-pointer self-start focus:outline-none"
        >
          Post Review
        </button>
      </form>

      {/* Review Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#0a2342]">{review.name}</h4>
                {review.canteenName && (
                  <span className="text-[9.5px] font-bold text-[#e87a5d] block mt-0.5">
                    for {review.canteenName}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-black text-amber-500 flex items-center gap-0.5 self-start">
                ⭐ {review.rating}.0
              </span>
            </div>
            <p className="text-xs font-medium leading-relaxed text-slate-500 italic">
              “{review.comment}”
            </p>
            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold text-slate-400">
              <span>Verified Student</span>
              <span>{review.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
