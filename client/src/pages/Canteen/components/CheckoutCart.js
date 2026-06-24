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
    <aside className="sticky top-6 h-fit rounded-3xl border border-slate-100 bg-white p-5 shadow-sm max-[1100px]:static">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-[#0a2342]">Your Cart</h2>
        {cart.length > 0 && (
          <button onClick={handleClearCart} className="text-[11px] font-black text-red-500">
            Clear
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="rounded-3xl bg-[#fff7f2] p-8 text-center">
          <div className="text-5xl">🛒</div>
          <p className="mt-3 text-xs font-bold text-slate-400">Your cart is empty.</p>
        </div>
      ) : (
        <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[#fff7f2] p-3">
              <div className="flex gap-3">
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="flex-1">
                  <h4 className="text-xs font-black text-[#0a2342]">{item.name}</h4>
                  {item.customNotes && (
                    <p className="text-[9px] font-semibold text-slate-400">{item.customNotes}</p>
                  )}
                  <p className="text-xs font-black text-[#e2725b]">Rs. {item.price}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAdjustQty(item.id, -1)}
                    className="h-7 w-7 rounded-lg bg-white font-black"
                  >
                    -
                  </button>
                  <span className="text-xs font-black">{item.qty}</span>
                  <button
                    onClick={() => handleAdjustQty(item.id, 1)}
                    className="h-7 w-7 rounded-lg bg-white font-black"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-black text-[#0a2342]">
                  Rs. {item.price * item.qty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase text-[#0a2342] tracking-wider">
            Contact Phone *
          </label>
          <input
            type="tel"
            required
            value={studentPhone}
            onChange={(e) => setStudentPhone(e.target.value)}
            placeholder="e.g. 03001234567"
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:border-[#e2725b]"
          />
        </div>
      )}

      <form onSubmit={handleApplyPromo} className="mt-4 flex gap-2">
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Promo code"
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold outline-none"
        />
        <button className="rounded-xl bg-[#e2725b] px-4 py-2 text-xs font-black text-white">
          Apply
        </button>
      </form>

      {promoError && <p className="mt-2 text-[10px] font-bold text-red-500">{promoError}</p>}

      {appliedPromo && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
          <span className="text-[10px] font-black text-emerald-600">
            {appliedPromo.desc}
          </span>
          <button onClick={handleRemovePromo} className="text-[10px] font-black text-red-500">
            Remove
          </button>
        </div>
      )}

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {cartSubtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>{isFreeDelivery ? "Free" : `Rs. ${platformFee}`}</span>
        </div>
        <div className="flex justify-between">
          <span>GST</span>
          <span>Rs. {gstTax}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>- Rs. {discountAmount}</span>
          </div>
        )}
      </div>

      {!isFreeDelivery && cartSubtotal > 0 && (
        <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-[10px] font-bold text-orange-600">
          Add Rs. {deliveryThreshold - cartSubtotal} more for free delivery.
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-black text-[#0a2342]">Total</span>
        <span className="text-xl font-black text-[#e2725b]">Rs. {cartTotal}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={cart.length === 0 || !studentPhone || !studentPhone.trim()}
        className="mt-4 w-full rounded-2xl bg-[#0a2342] py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#e2725b]"
      >
        Checkout Now
      </button>
    </aside>
  );
}