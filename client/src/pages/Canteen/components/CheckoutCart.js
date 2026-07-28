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
  studentPhone,
  setStudentPhone,
}) {
  return (
    <aside className="sticky top-20 h-fit flex flex-col gap-4 w-full max-[1200px]:static">
      {/* Main Cart Card Container */}
      <div className="rounded-[28px] border border-slate-200/90 bg-white p-5 shadow-xl hover:shadow-2xl hover:border-[#071A35]/30 transition-all duration-300 shrink-0">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#071A35] to-[#0079c2] text-white text-[11px] font-black shadow-xs">
              3
            </span>
            <h2 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide">
              Your Order Cart
            </h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors bg-transparent border-none cursor-pointer focus:outline-none"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Cart Items List */}
        {cart.length === 0 ? (
          <div className="rounded-[20px] bg-[#00c2cb]/5 border border-[#00c2cb]/20 p-6 text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-3xl mb-1.5 animate-pulse">🛒</div>
            <p className="text-[10.5px] font-bold text-slate-400">Your cart is empty.</p>
          </div>
        ) : (
          <div className="max-h-[220px] space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
            {cart.map((item) => (
              <div
                key={item.id}
                className="rounded-[18px] bg-slate-50 border border-slate-100 p-2.5 flex flex-col gap-2"
              >
                <div className="flex gap-2.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-9 w-9 rounded-lg object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-[#0a2342] truncate">{item.name}</h4>
                    {item.customNotes && (
                      <p className="text-[8.5px] font-bold text-slate-400 truncate mt-0.5">
                        {item.customNotes}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[11px] font-black text-[#0079c2]">
                        Rs. {item.price}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        x{item.qty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adjust Qty & Delete Action Row */}
                <div className="flex items-center justify-between border-t border-slate-200/50 pt-1.5">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => handleAdjustQty(item.id, -1)}
                      className="h-5 w-5 rounded bg-slate-50 font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-black text-[#0a2342] w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleAdjustQty(item.id, 1)}
                      className="h-5 w-5 rounded bg-slate-50 font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black text-[#0a2342]">
                      Rs. {item.price * item.qty}
                    </span>
                    <button
                      onClick={() => handleAdjustQty(item.id, -item.qty)}
                      className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer bg-transparent border-none focus:outline-none text-xs"
                      title="Delete item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact details */}
        {cart.length > 0 && (
          <div className="mt-4 flex flex-col gap-1.5">
            <label htmlFor="canteen-student-phone" className="text-[9px] font-black uppercase text-[#0a2342] tracking-wider">
              WhatsApp Contact Phone *
            </label>
            <input
              id="canteen-student-phone"
              name="studentPhone"
              type="tel"
              required
              value={studentPhone || ""}
              onChange={(e) => setStudentPhone(e.target.value)}
              placeholder="e.g. 03001234567"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0a2342] outline-none focus:bg-white focus:border-[#00c2cb] focus:ring-4 focus:ring-[#00c2cb]/15 transition-all duration-300 placeholder-slate-400 shadow-xs"
            />
          </div>
        )}

        {/* Promo code form */}
        <form onSubmit={handleApplyPromo} className="mt-3 flex gap-2">
          <label htmlFor="canteen-promo-code" className="sr-only">
            Promo code
          </label>
          <input
            id="canteen-promo-code"
            name="promoCode"
            value={promoCode || ""}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code"
            className="min-w-0 flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0a2342] outline-none focus:bg-white focus:border-[#00c2cb] focus:ring-4 focus:ring-[#00c2cb]/15 transition-all duration-300 placeholder-slate-400 shadow-xs"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#0a2342] hover:bg-[#00c2cb] hover:text-slate-950 px-4 text-xs font-black text-white transition-colors duration-300 cursor-pointer shadow-xs focus:outline-none"
          >
            Apply
          </button>
        </form>

        {promoError && (
          <p className="mt-1.5 text-[9.5px] font-bold text-rose-500">{promoError}</p>
        )}

        {appliedPromo && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5">
            <span className="text-[9.5px] font-black text-emerald-600">
              {appliedPromo.desc}
            </span>
            <button
              onClick={handleRemovePromo}
              className="text-[9.5px] font-black text-rose-500 hover:text-rose-600 bg-transparent border-none cursor-pointer focus:outline-none"
            >
              Remove
            </button>
          </div>
        )}

        {/* Billing details */}
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs font-bold text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[#0a2342]">Rs. {cartSubtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span className="text-[#0a2342]">
              {isFreeDelivery ? "Free" : `Rs. ${platformFee}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>GST</span>
            <span className="text-[#0a2342]">Rs. {gstTax}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>- Rs. {discountAmount}</span>
            </div>
          )}
        </div>

        {!isFreeDelivery && cartSubtotal > 0 && (
          <p className="mt-2.5 rounded-xl bg-[#00c2cb]/10 border border-[#00c2cb]/30 p-2 text-[9px] font-bold text-[#0079c2] leading-tight">
            Add Rs. {deliveryThreshold - cartSubtotal} more for free delivery.
          </p>
        )}

        {/* Total Price */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs font-black text-[#0a2342] uppercase tracking-wider">
            Total
          </span>
          <span className="text-base font-black text-[#0079c2]">Rs. {cartTotal}</span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || !studentPhone || !studentPhone.trim()}
          className={`mt-4 w-full rounded-[18px] py-3.5 text-xs font-black tracking-widest uppercase text-white transition-all duration-300 shadow-md cursor-pointer focus:outline-none flex items-center justify-center gap-2 ${cart.length > 0 && studentPhone && studentPhone.trim()
              ? "bg-gradient-to-r from-[#071A35] via-[#0a2342] to-[#0079c2] hover:from-[#0a2342] hover:to-[#00c2cb] shadow-[0_6px_20px_rgba(0,121,194,0.3)] scale-[1.01]"
              : "bg-[#0a2342] disabled:cursor-not-allowed disabled:opacity-50"
            }`}
        >
          <span>🚀 Place Order</span>
          {cart.length > 0 && <span>(Rs. {cartTotal})</span>}
        </button>
      </div>

      {/* Bottom widgets area */}
      <div className="flex flex-col gap-2.5 shrink-0">
        {/* Scooter confirmation widget */}
        <div className="flex gap-2.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3 items-center shadow-2xs">
          <span className="text-xl shrink-0">🛵</span>
          <div className="flex flex-col gap-0.5 text-left">
            <h4 className="text-[10.5px] font-extrabold text-emerald-800 leading-tight">
              Order Confirmation
            </h4>
            <p className="text-[9px] text-emerald-600 font-semibold leading-tight">
              Order will be confirmed via WhatsApp call or message.
            </p>
          </div>
        </div>

        {/* Support widget */}
        <a
          href="https://wa.me/+923001234567?text=Hi%20CampusConnect%20Support!%20I%20need%20help%20with%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-2.5 bg-blue-50/50 border border-blue-100 rounded-2xl p-3 items-center shadow-2xs text-left no-underline hover:border-blue-200 transition-colors group"
        >
          <span className="text-xl shrink-0">🎧</span>
          <div className="flex flex-col gap-0.5">
            <h4 className="text-[10.5px] font-extrabold text-blue-800 leading-tight group-hover:text-blue-900 transition-colors">
              Need Help?
            </h4>
            <p className="text-[9px] text-blue-600 font-semibold leading-tight">
              Contact us on WhatsApp for 24/7 support.
            </p>
          </div>
        </a>
      </div>
    </aside>
  );
}