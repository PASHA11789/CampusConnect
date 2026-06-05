import React from "react";

export default function OrderTracker({
  isTrackingOpen,
  setIsTrackingOpen,
  trackingStep,
  orderId,
}) {
  if (!isTrackingOpen) return null;

  const steps = [
    { id: 1, label: "Order Placed", icon: "📝" },
    { id: 2, label: "Preparing", icon: "👨‍🍳" },
    { id: 3, label: "On The Way", icon: "🛵" },
    { id: 4, label: "Delivered", icon: "🎉" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0a2342]">Order Tracking</h2>
            <p className="text-xs font-bold text-slate-400">Order ID: {orderId}</p>
          </div>
          <button
            onClick={() => setIsTrackingOpen(false)}
            className="h-9 w-9 rounded-full bg-slate-100 text-xl font-black"
          >
            ×
          </button>
        </div>

        <div className="mt-7 rounded-3xl bg-[#fff7f2] p-5">
          <div className="relative h-3 rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#e2725b] to-[#0a2342]"
              style={{ width: `${((trackingStep - 1) / 3) * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 text-3xl transition-all"
              style={{ left: `${((trackingStep - 1) / 3) * 100}%` }}
            >
              🛵
            </div>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-3 max-sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`rounded-2xl p-3 text-center ${trackingStep >= step.id ? "bg-white shadow-sm" : "opacity-40"
                  }`}
              >
                <div className="text-2xl">{step.icon}</div>
                <p className="mt-2 text-[10px] font-black text-[#0a2342]">{step.label}</p>
                {trackingStep === step.id && (
                  <span className="text-[9px] font-black text-[#e2725b]">Live</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-100 p-4">
          <h3 className="text-sm font-black text-[#0a2342]">Rider: Ali Raza</h3>
          <p className="text-xs font-semibold text-slate-400">Estimated time: 10-15 minutes</p>
        </div>
      </div>
    </div>
  );
}