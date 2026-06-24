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
    <aside className="sticky top-6 h-fit flex flex-col gap-5 w-full max-[1100px]:static">
      {/* Main Cart Card Container */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.015)]">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide">
            Your Cart
          </h2>
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
          <div className="rounded-[24px] bg-[#fff5f2]/40 border border-orange-100/20 p-8 text-center">
            <div className="text-4xl mb-2">🛒</div>
            <p className="text-[10.5px] font-bold text-slate-400">Your cart is empty.</p>
          </div>
        ) : (
          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1 scrollbar-none">
            {cart.map((item) => (
              <div
                key={item.id}
                className="rounded-[20px] bg-slate-50 border border-slate-100 p-3 flex flex-col gap-2.5"
              >
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-[#0a2342] truncate">{item.name}</h4>
                    {item.customNotes && (
                      <p className="text-[8.5px] font-bold text-slate-400 truncate mt-0.5">
                        {item.customNotes}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[11px] font-black text-[#e87a5d]">
                        Rs. {item.price}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        x{item.qty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adjust Qty & Delete Action Row */}
                <div className="flex items-center justify-between border-t border-slate-200/50 pt-2">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => handleAdjustQty(item.id, -1)}
                      className="h-6 w-6 rounded bg-slate-50 font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-black text-[#0a2342] w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleAdjustQty(item.id, 1)}
                      className="h-6 w-6 rounded bg-slate-50 font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-[#0a2342]">
                      Rs. {item.price * item.qty}
                    </span>
                    <button
                      onClick={() => handleAdjustQty(item.id, -item.qty)}
                      className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer bg-transparent border-none focus:outline-none text-sm"
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
          <div className="mt-5 flex flex-col gap-2">
            <label className="text-[9px] font-black uppercase text-[#0a2342] tracking-wider">
              WhatsApp Contact Phone *
            </label>
            <input
              type="tel"
              required
              value={studentPhone || ""}
              onChange={(e) => setStudentPhone(e.target.value)}
              placeholder="e.g. 03001234567"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0a2342] outline-none focus:bg-white focus:border-[#e87a5d] transition-all duration-300 placeholder-slate-400 shadow-sm"
            />
          </div>
        )}

        {/* Promo code form */}
        <form onSubmit={handleApplyPromo} className="mt-4 flex gap-2">
          <input
            value={promoCode || ""}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code"
            className="min-w-0 flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0a2342] outline-none focus:bg-white focus:border-[#e87a5d] transition-all duration-300 placeholder-slate-400 shadow-sm"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#0a2342] hover:bg-[#e87a5d] px-4 text-xs font-black text-white transition-colors duration-300 cursor-pointer shadow-sm focus:outline-none"
          >
            Apply
          </button>
        </form>

        {promoError && (
          <p className="mt-2 text-[9.5px] font-bold text-rose-500">{promoError}</p>
        )}

        {appliedPromo && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
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
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-400">
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
          <p className="mt-3 rounded-xl bg-orange-50 border border-orange-100/50 p-2.5 text-[9px] font-bold text-orange-600 leading-tight">
            Add Rs. {deliveryThreshold - cartSubtotal} more for free delivery.
          </p>
        )}

        {/* Total Price */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-black text-[#0a2342] uppercase tracking-wider">
            Total
          </span>
          <span className="text-lg font-black text-[#e87a5d]">Rs. {cartTotal}</span>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || !studentPhone || !studentPhone.trim()}
          className="mt-5 w-full rounded-[20px] bg-[#0a2342] hover:bg-[#e87a5d] py-4 text-xs font-black tracking-widest uppercase text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(10,35,66,0.3)] hover:shadow-[0_8px_20px_-6px_rgba(232,122,93,0.3)] cursor-pointer focus:outline-none"
        >
          Place Order
        </button>
      </div>

      {/* Bottom widgets area */}
      <div className="flex flex-col gap-3">
        {/* Scooter confirmation widget */}
        <div className="flex gap-3 bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-4 items-start shadow-[0_4px_12px_rgba(16,185,129,0.015)]">
          <span className="text-2xl pt-0.5 shrink-0">🛵</span>
          <div className="flex flex-col gap-0.5">
            <h4 className="text-[11px] font-extrabold text-emerald-800 leading-tight">
              Order Confirmation
            </h4>
            <p className="text-[9.5px] text-emerald-600 font-semibold leading-relaxed">
              We will confirm your order via WhatsApp call or message.
            </p>
          </div>
        </div>

        {/* Support widget */}
        <a
          href="https://wa.me/+923001234567?text=Hi%20CampusConnect%20Support!%20I%20need%20help%20with%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 bg-blue-50/50 border border-blue-100 rounded-[24px] p-4 items-start shadow-[0_4px_12px_rgba(59,130,246,0.015)] text-left no-underline hover:border-blue-200 transition-colors group"
        >
          <span className="text-2xl pt-0.5 shrink-0">🎧</span>
          <div className="flex flex-col gap-0.5">
            <h4 className="text-[11px] font-extrabold text-blue-800 leading-tight group-hover:text-blue-900 transition-colors">
              Need Help?
            </h4>
            <p className="text-[9.5px] text-blue-600 font-semibold leading-relaxed">
              Contact us on WhatsApp for 24/7 support.
            </p>
          </div>
        </a>
      </div>
    </aside>
  );
}