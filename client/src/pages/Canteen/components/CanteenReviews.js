import React from "react";

export default function CanteenReviews({
  reviews,
  newReviewName,
  newReviewComment,
  setNewReviewComment,
  newReviewRating,
  setNewReviewRating,
  handlePostReview,
}) {
  return (
    <div
      id="ratings-section-header"
      className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col gap-5 shadow-sm"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide">
          Community Ratings & Reviews
        </h3>
        <span className="text-[11px] text-slate-400 font-bold">
          {reviews.length} reviews
        </span>
      </div>

      {/* Average Stats Row */}
      <div className="flex gap-4 items-center bg-gradient-to-r from-teal-50/60 to-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex flex-col items-center justify-center shrink-0">
          <span className="text-[38px] font-black text-[#0a2342] leading-none">
            {(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)}
          </span>
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={
                  i < Math.round(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length)
                    ? "text-[#fbbf24] text-[14px]"
                    : "text-slate-200 text-[14px]"
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-[9.5px] text-slate-400 font-bold mt-1">
            out of 5
          </span>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-[10px]">
                <span className="text-slate-500 font-bold w-3 text-right">{star}</span>
                <span className="text-[#fbbf24] text-[10px]">★</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#fbbf24] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-slate-400 font-bold w-5">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_310px] gap-6 max-[800px]:grid-cols-1">

        {/* Reviews Feed */}
        <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-none">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5 hover:border-slate-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00c2cb]/30 to-[#0a2342]/10 flex items-center justify-center text-[12px] font-extrabold text-[#0a2342] shrink-0">
                    {rev.name[0]}
                  </div>
                  <span className="text-[12px] font-black text-slate-700">{rev.name}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < rev.rating ? "text-[#fbbf24] text-[11px]" : "text-slate-200 text-[11px]"}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[11.5px] text-slate-500 font-medium italic leading-relaxed">
                "{rev.comment}"
              </p>
              <span className="text-[9px] text-slate-300 font-semibold">{rev.date}</span>
            </div>
          ))}
        </div>

        {/* Review Submission Form */}
        <form
          onSubmit={handlePostReview}
          className="flex flex-col gap-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 h-fit"
        >
          <div>
            <h4 className="text-[12.5px] font-extrabold text-[#0a2342] uppercase">
              Share Your Experience
            </h4>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Posting as <strong className="text-[#0a2342]">{newReviewName || "Anonymous"}</strong>
            </p>
          </div>

          {/* Star Selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-500">Select Rating</span>
            <div className="flex gap-1 text-[22px] cursor-pointer">
              {Array.from({ length: 5 }).map((_, i) => {
                const val = i + 1;
                return (
                  <span
                    key={i}
                    onClick={() => setNewReviewRating(val)}
                    className={`transition-transform hover:scale-110 active:scale-95 select-none ${
                      val <= newReviewRating ? "text-[#fbbf24]" : "text-slate-200"
                    }`}
                  >
                    ★
                  </span>
                );
              })}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="review-desc"
              className="text-[11px] font-bold text-slate-500"
            >
              Write Your Feedback
            </label>
            <textarea
              id="review-desc"
              placeholder="Tell us about food quality, speed, or price..."
              className="w-full px-3 py-2 text-[11.5px] font-semibold border border-slate-200 rounded-xl min-h-[90px] focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 resize-none"
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0a2342] hover:bg-[#00c2cb] text-white border-none py-2.5 rounded-xl text-[12px] font-bold cursor-pointer transition-colors focus:outline-none tracking-wide"
          >
            Post Review ★
          </button>
        </form>
      </div>
    </div>
  );
}
