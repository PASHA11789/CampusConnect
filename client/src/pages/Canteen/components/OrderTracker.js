import React from "react";

export default function OrderTracker({
  isTrackingOpen,
  setIsTrackingOpen,
  trackingStep,
  orderId,
}) {
  if (!isTrackingOpen) return null;

  const steps = [
    {
      icon: "📝",
      label: "Order Confirmed",
      desc: "Your payment is verified and order is sent to the shop counters.",
    },
    {
      icon: "👨‍🍳",
      label: "Preparing Meals",
      desc: "The chef has accepted your order and ingredients are being prepped.",
    },
    {
      icon: "🛵",
      label: "Out for Delivery",
      desc: "Rider is dispatching or packaging is being assembled at counter.",
    },
    {
      icon: "🎉",
      label: "Ready / Delivered",
      desc: "Please show order ID at counter or expect your rider shortly!",
    },
  ];

  const statusLabels = ["", "Order Placed", "Preparing Meal", "Out for Delivery", "Order Arrived! 🎉"];

  return (
    <div className="fixed inset-0 bg-[#0a2342]/45 backdrop-blur-[8px] flex items-center justify-center z-[2000] animate-modal-fade-in">
      <div className="w-[90%] max-w-[500px] bg-white rounded-[26px] p-6 shadow-2xl flex flex-col gap-5 animate-modal-slide-in">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[15.5px] font-black text-[#0a2342] tracking-tight">
              Live Order Tracker
            </h3>
            <p className="text-[10.5px] text-slate-400 font-bold mt-0.5">
              Order ID:{" "}
              <span className="text-[#0a2342] font-extrabold">{orderId}</span>
            </p>
          </div>
          <button
            className="bg-none border-none text-[24px] leading-none text-slate-400 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-slate-100 hover:text-red-500 focus:outline-none"
            onClick={() => setIsTrackingOpen(false)}
          >
            ×
          </button>
        </div>

        {/* Status Badge */}
        <div className="bg-[#00c2cb]/10 text-[#00c2cb] text-[12.5px] font-extrabold px-4 py-2 rounded-full w-fit">
          {statusLabels[trackingStep]}
        </div>

        {/* Scooter Progress Bar */}
        <div className="relative w-full h-2.5 bg-slate-100 rounded-full mt-1 mb-3 overflow-visible">
          <div
            className="h-full bg-gradient-to-r from-[#00c2cb] to-[#0a2342] rounded-full transition-all duration-700 ease-in-out"
            style={{ width: `${((trackingStep - 1) / 3) * 100}%` }}
          />
          {/* Scooter */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -ml-4 text-[22px] transition-all duration-700 ease-in-out select-none animate-bounce"
            style={{ left: `${Math.max(0, ((trackingStep - 1) / 3) * 100)}%` }}
          >
            🛵
          </div>

          {/* Step dots on track */}
          {[0, 33.3, 66.6, 100].map((pos, i) => (
            <div
              key={i}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white transition-all duration-500 ${
                i < trackingStep ? "bg-[#00c2cb]" : "bg-slate-200"
              }`}
              style={{ left: `${pos}%`, transform: "translate(-50%, -50%)" }}
            />
          ))}
        </div>

        {/* Timeline Steps */}
        <div className="flex flex-col gap-4">
          {steps.map((step, i) => {
            const stepNum = i + 1;
            const isDone = trackingStep > stepNum;
            const isActive = trackingStep === stepNum;
            const isPending = trackingStep < stepNum;

            return (
              <div
                key={i}
                className={`flex gap-3.5 transition-all duration-300 ${isPending ? "opacity-40" : ""}`}
              >
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <div
                    className={`w-4 h-4 rounded-full border-2 border-white transition-all shadow-sm ${
                      isDone
                        ? "bg-emerald-500"
                        : isActive
                        ? "bg-[#00c2cb] ring-4 ring-[#00c2cb]/20"
                        : "bg-slate-200"
                    }`}
                  />
                  {i < steps.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 mt-1 min-h-[24px] rounded-full transition-all ${
                        isDone ? "bg-emerald-400" : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 pb-2">
                  <span
                    className={`text-[12.5px] font-bold flex items-center gap-1.5 ${
                      isActive
                        ? "text-[#00c2cb] font-black"
                        : isDone
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {step.icon} {step.label}
                    {isDone && (
                      <span className="text-emerald-500 text-[10px] font-extrabold">✓ Done</span>
                    )}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-semibold leading-relaxed">
                    {step.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rider Card */}
        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <div className="flex gap-2.5 items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00c2cb] to-[#0a2342] flex items-center justify-center font-bold text-white text-[12px]">
              AR
            </div>
            <div className="flex flex-col">
              <span className="text-[11.5px] font-bold text-slate-700">Rider: Ali Raza</span>
              <span className="text-[9.5px] text-slate-400 font-bold">Minhaj Delivery Express</span>
            </div>
          </div>
          <button
            onClick={() => alert("Mock call: Connecting with rider Ali Raza...")}
            className="bg-[#00c2cb] hover:bg-[#00b2bb] text-white border-none py-1.5 px-4 rounded-xl text-[11px] font-bold cursor-pointer transition-all shadow-sm focus:outline-none"
          >
            📞 Call Rider
          </button>
        </div>

        {trackingStep === 4 && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center">
            <p className="text-[12px] font-extrabold text-emerald-700">
              🎉 Your order has arrived! Enjoy your meal!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            className="bg-[#0a2342] hover:bg-[#00c2cb] text-white border-none py-2 px-6 rounded-xl text-[12px] font-bold cursor-pointer transition-colors shadow-sm focus:outline-none"
            onClick={() => setIsTrackingOpen(false)}
          >
            Okay, Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
