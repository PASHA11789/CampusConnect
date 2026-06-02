import React from "react";

export default function CheckoutCart({
  cart,
  cartSubtotal,
  cartTotal,
  gstTax,
  platformFee,
  discountAmount,
  appliedPromo,
  promoCode,
  setPromoCode,
  promoError,
  handleApplyPromo,
  handleRemovePromo,
  handleAdjustQty,
  handleClearCart,
  handleCheckout,
  isFreeDelivery,
  deliveryThreshold,
  reviews,
}) {
  return (
    <div className="flex flex-col gap-6 min-[1100px]:sticky min-[1100px]:top-[90px] min-[1100px]:self-start min-[1100px]:max-h-[calc(100vh-120px)] min-[1100px]:overflow-y-auto scrollbar-none pr-1 z-20">

      {/* ── YOUR CART ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-[18px] flex flex-col shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <h3 className="text-[13.5px] font-black text-[#0a2342] uppercase tracking-wide">
            Your Order Cart
          </h3>
          {cart.length > 0 && (
            <span className="text-[10px] text-white font-extrabold bg-[#00c2cb] px-2 py-0.5 rounded-full">
              {cart.reduce((sum, i) => sum + i.qty, 0)} items
            </span>
          )}
        </div>

        {/* Free Delivery Progress */}
        {cart.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 mb-3 flex flex-col gap-1.5 shrink-0">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
              {isFreeDelivery ? (
                <span className="text-emerald-600 flex items-center gap-1">🎉 Free Delivery Unlocked!</span>
              ) : (
                <span>
                  🛵 Add Rs.{" "}
                  <strong className="text-[#0a2342]">{deliveryThreshold - cartSubtotal}</strong> more
                  for Free Delivery
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isFreeDelivery ? "bg-emerald-500" : "bg-[#00c2cb]"}`}
                style={{ width: `${Math.min(100, (cartSubtotal / deliveryThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex flex-col gap-2 max-h-[230px] overflow-y-auto pr-1 scrollbar-none">
          {cart.length > 0 ? (
            cart.map((ci) => (
              <div
                key={ci.id}
                className="flex gap-2 items-center py-2 border-b border-slate-50 last:border-none"
              >
                <img
                  src={ci.image}
                  alt={ci.name}
                  className="w-9 h-9 rounded-lg object-cover bg-slate-50 flex-shrink-0"
                />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <h5 className="text-[11.5px] font-bold text-[#0a2342] truncate leading-none">
                    {ci.name}
                  </h5>
                  {ci.customNotes && (
                    <span className="text-[9px] text-[#00c2cb] font-semibold truncate leading-none mt-0.5">
                      {ci.customNotes}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                    Rs. {ci.price * ci.qty}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] flex items-center justify-center border-none cursor-pointer transition-colors"
                    onClick={() => handleAdjustQty(ci.id, -1)}
                  >
                    −
                  </button>
                  <span className="text-[11px] font-bold text-[#0a2342] min-w-[14px] text-center">
                    {ci.qty}
                  </span>
                  <button
                    className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] flex items-center justify-center border-none cursor-pointer transition-colors"
                    onClick={() => handleAdjustQty(ci.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[11.5px] text-slate-400 font-bold flex flex-col items-center justify-center gap-1.5">
              <span className="text-3xl opacity-40">🛒</span>
              Your cart is empty.
              <span className="text-[10px] text-slate-300 font-semibold">Add items to place order</span>
            </div>
          )}
        </div>

        {/* Promo Code */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 pt-3.5 mt-3 flex flex-col gap-1.5">
            {!appliedPromo ? (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE (e.g. WELCOME50)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-[10.5px] border border-slate-200 rounded-lg text-slate-700 font-bold focus:outline-none focus:border-[#00c2cb]"
                />
                <button
                  type="submit"
                  className="bg-[#0a2342] hover:bg-[#00c2cb] text-white text-[10.5px] font-bold py-1.5 px-3 rounded-lg border-none cursor-pointer transition-colors focus:outline-none"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 text-emerald-700 text-[10.5px] font-bold py-1.5 px-3 rounded-xl flex justify-between items-center border border-emerald-100 shadow-sm">
                <span>🏷️ {appliedPromo.code} Applied!</span>
                <button
                  onClick={handleRemovePromo}
                  className="bg-none border-none text-[16px] leading-none cursor-pointer font-bold hover:text-red-500 focus:outline-none"
                >
                  ×
                </button>
              </div>
            )}
            {promoError && (
              <span className="text-red-500 text-[10px] font-bold pl-1">⚠️ {promoError}</span>
            )}
            {!promoError && !appliedPromo && (
              <p className="text-[9.5px] text-slate-300 font-semibold pl-1">
                Try: WELCOME50 · FREEPASS · STUDENT15
              </p>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        {cart.length > 0 && (
          <>
            <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
                <span>Subtotal</span>
                <span className="text-[#0a2342]">Rs. {cartSubtotal}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between items-center text-[11px] text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>−Rs. {discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
                <span>GST (16%)</span>
                <span className="text-[#0a2342]">Rs. {gstTax}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
                <span>Delivery Fee</span>
                <span className={`${platformFee === 0 ? "text-emerald-600" : "text-[#0a2342]"}`}>
                  {platformFee === 0 ? "FREE" : `Rs. ${platformFee}`}
                </span>
              </div>
              <div className="text-[12.5px] text-[#0a2342] font-black border-t border-slate-100 pt-2.5 mt-1 flex justify-between items-center">
                <span>Total Bill</span>
                <span className="text-[#00c2cb] font-black text-[14px]">Rs. {cartTotal}</span>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-[#00c2cb] to-[#0a2342] hover:opacity-90 text-white border-none py-3 px-4 rounded-xl text-[12.5px] font-bold cursor-pointer transition-all hover:shadow-lg mt-4 focus:outline-none tracking-wide"
              onClick={handleCheckout}
            >
              Proceed to Checkout →
            </button>
            <button
              onClick={handleClearCart}
              className="bg-transparent border-none text-[#ef4444] text-[10.5px] font-bold cursor-pointer mt-1.5 mx-auto w-fit hover:underline focus:outline-none"
            >
              Clear Cart
            </button>
          </>
        )}
      </div>

      {/* ── STATIC ORDER TRACKING MINI-PANEL ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <h3 className="text-[12.5px] font-extrabold text-[#0a2342] uppercase mb-4">
          Order Tracking
        </h3>
        <div className="flex flex-col gap-3.5">
          {[
            { label: "Order Placed", time: "12:30 PM", done: true },
            { label: "Preparing", time: "12:35 PM", done: true },
            { label: "Out for Delivery", time: "12:50 PM", active: true },
            { label: "Delivered", time: "--:--", done: false },
          ].map(({ label, time, done, active }) => (
            <div key={label} className="flex gap-2.5 items-start">
              <span
                className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] shrink-0 font-bold transition-all ${
                  done ? "bg-emerald-500" : active ? "bg-[#00c2cb] ring-4 ring-[#00c2cb]/15" : "bg-slate-200 text-slate-400"
                }`}
              >
                {done ? "✓" : "•"}
              </span>
              <div className="flex flex-col">
                <span
                  className={`text-[11.5px] font-bold leading-none ${
                    active ? "text-[#00c2cb]" : done ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {label}
                </span>
                <span className="text-[9.5px] text-slate-400 mt-0.5">{time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOP REVIEWS ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[12.5px] font-extrabold text-[#0a2342] uppercase">Top Reviews</h3>
          <button
            onClick={() => {
              const el = document.getElementById("ratings-section-header");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-[10px] font-extrabold text-slate-400 hover:text-[#00c2cb] cursor-pointer bg-transparent border-none focus:outline-none"
          >
            View All
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {reviews.slice(0, 3).map((rev, index) => (
            <div key={index} className="flex gap-2.5 py-2 border-b border-slate-50 last:border-none">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00c2cb]/20 to-[#0a2342]/10 flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-[#0a2342]">
                {rev.name[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[11.5px] font-bold text-slate-700 truncate">{rev.name}</span>
                  <span className="text-[9px] text-[#fbbf24] font-bold shrink-0">★ {rev.rating}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5 line-clamp-2">
                  "{rev.comment}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── INVITE & EARN ── */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-3xl p-5 flex justify-between items-center relative overflow-hidden shadow-sm">
        <div className="flex flex-col gap-1 max-w-[65%] z-10">
          <h4 className="text-[12.5px] font-extrabold text-[#0a2342]">Invite & Earn</h4>
          <p className="text-[10px] text-slate-400 font-medium leading-tight">
            Invite friends and earn reward points on order discounts.
          </p>
          <button className="bg-[#00c2cb] hover:bg-[#00b2bb] text-white border-none py-1.5 px-3 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all mt-1.5 w-fit focus:outline-none shadow-sm">
            Invite Now 🎁
          </button>
        </div>
        <span className="text-5xl opacity-30 rotate-12 shrink-0 select-none">🎁</span>
      </div>

    </div>
  );
}
