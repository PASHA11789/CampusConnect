import React from "react";

export default function OrderTracker({
  isTrackingOpen,
  setIsTrackingOpen,
  orderId,
  restaurantPhone = "+923001234567",
  restaurantName = "Campus Bites",
}) {
  if (!isTrackingOpen) return null;

  // Clean the phone number (remove spaces, symbols)
  const cleanPhone = restaurantPhone.replace(/[^0-9+]/g, "");
  const whatsappMsg = `Hi! I just placed an order (Order ID: ${orderId}) at ${restaurantName}. I would like to track the order status.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl border border-slate-100 text-center">
        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsTrackingOpen(false)}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-lg font-black transition-colors"
          >
            ×
          </button>
        </div>

        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mb-5 shadow-sm">
          🎉
        </div>

        {/* Title */}
        <h2 className="text-xl font-black text-[#0a2342] tracking-tight">Order Placed Successfully!</h2>
        <p className="text-xs font-semibold text-slate-400 mt-1.5">
          Your order has been registered at the canteen.
        </p>

        {/* Order Details Card */}
        <div className="my-6 bg-slate-50 border border-slate-100 rounded-2xl p-4.5 text-left text-xs font-bold text-slate-500">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
            <span>Order ID</span>
            <span className="text-[#0a2342] font-black">{orderId}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span>Canteen / Vendor</span>
            <span className="text-[#0a2342] font-black">{restaurantName}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-6">
          Order tracking and status updates are managed directly via WhatsApp calls and messages. Click the button below to connect with the restaurant.
        </p>

        {/* Actions */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] transition-all duration-300"
          >
            💬 Track on WhatsApp
          </a>
          
          <button
            onClick={() => setIsTrackingOpen(false)}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#0a2342] rounded-xl text-xs font-extrabold transition-all duration-200"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}