import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../../utils/helpers";
import OrderRatingModal from "../../../components/canteen/OrderRatingModal";

const STEPS = [
  { id: "accepted", label: "Accepted" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "picked_up", label: "En Route" },
  { id: "arrived", label: "Arrived" },
  { id: "completed", label: "Delivered" },
];

const STATUS_MESSAGES = {
  pending:    { emoji: "⏳", text: "Waiting for the vendor to accept your order..." },
  accepted:   { emoji: "✅", text: "Order accepted! We're finding a rider for you." },
  preparing:  { emoji: "🍳", text: "Your food is being freshly prepared!" },
  ready:      { emoji: "🍔", text: "Food is ready! The rider is picking it up now." },
  picked_up:  { emoji: "🛵", text: "Your order is on its way to you!" },
  arrived:    { emoji: "📍", text: "Your rider has arrived at the delivery point!" },
  completed:  { emoji: "🎉", text: "Delivered! Enjoy your meal." },
  cancelled:  { emoji: "❌", text: "Your order was cancelled. We're sorry for the inconvenience." },
};

export default function OrderTracker({
  isTrackingOpen,
  setIsTrackingOpen,
  orderId,
  restaurantPhone = "+923001234567",
  restaurantName = "Campus Bites",
  studentId = "",
}) {
  const [nudgeStatus, setNudgeStatus] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [liveStatus, setLiveStatus] = useState("pending");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [riderNudgeSent, setRiderNudgeSent] = useState(false);

  const getCurrentStep = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "accepted") return 0;
    if (s === "preparing") return 1;
    if (s === "ready") return 2;
    if (s === "picked_up") return 3;
    if (s === "arrived") return 4;
    if (s === "completed" || s === "delivered") return 5;
    return -1; // pending or unknown
  };
  const currentStep = getCurrentStep(liveStatus);


  // Handle Socket & BroadcastChannel listener for order status updates & arrival pings
  useEffect(() => {
    if (!isTrackingOpen) return;

    const updateStatusLocally = (newStatus, msg) => {
      setLiveStatus(newStatus);
      if (newStatus === "arrived") {
        setArrivalMessage(msg || "Rider has arrived at your location!");
      }
      if (newStatus === "completed" || newStatus === "delivered") {
        setShowRatingModal(true);
      }
    };

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      if (studentId) {
        socket.emit("join_room", studentId);
      }
      socket.emit("join_user_room", studentId);
    });

    socket.on("order_status_update", (data) => {
      if (!orderId || data.orderId === orderId) {
        updateStatusLocally(data.status, data.message);
      }
    });

    socket.on("order_arrived", (data) => {
      if (!orderId || data.orderId === orderId) {
        updateStatusLocally("arrived", data.message);
      }
    });

    socket.on("order_delivered", (data) => {
      if (!orderId || data.orderId === orderId) {
        updateStatusLocally("completed", data.message);
      }
    });

    let channel;
    try {
      channel = new BroadcastChannel("campus_connect_orders");
      channel.onmessage = (event) => {
        if (event.data && event.data.status) {
          updateStatusLocally(event.data.status, event.data.message);
        }
      };
    } catch (e) {}

    return () => {
      socket.disconnect();
      if (channel) channel.close();
    };
  }, [orderId, isTrackingOpen, studentId]);

  // Handle Countdown Timer for Nudge Cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!isTrackingOpen) return null;

  // Clean the phone number
  const cleanPhone = restaurantPhone.replace(/[^0-9+]/g, "");
  const whatsappMsg = `Hi! I just placed an order (Order ID: ${orderId}) at ${restaurantName}. I would like to track the order status.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

  // Handle Nudge Request
  const handleNudgeVendor = async () => {
    if (cooldown > 0) return;
    try {
      setNudgeStatus("Sending nudge...");
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.post(
        `/api/orders/${orderId}/nudge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setNudgeStatus("🔔 Nudge sent to vendor!");
        setCooldown(180); // 3 minutes
      }
    } catch (err) {
      if (err.response?.status === 429) {
        const remaining = err.response.data?.retryAfterSeconds || 180;
        setCooldown(remaining);
        setNudgeStatus(`Rate limited: Please wait ${remaining}s before nudging again.`);
      } else {
        console.error("Nudge error:", err);
        setNudgeStatus(err.response?.data?.message || "Failed to send nudge. Please try again.");
      }
    }
  };

  const handleNudgeRiderArrival = async () => {
    try {
      setRiderNudgeSent(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      await axios.post(`/api/orders/${orderId}/nudge-rider`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(() => setRiderNudgeSent(false), 6000);
    } catch (err) {
      console.error("Error nudging rider on arrival:", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 animate-fade-in">
        <div className="w-full max-w-md rounded-[32px] bg-white p-7 shadow-2xl border border-slate-100 text-center">
          {/* Header */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsTrackingOpen(false)}
              className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-lg font-black transition-colors cursor-pointer"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#00c2cb] text-2xl shadow-inner">
              📍
            </div>
            <h3 className="text-xl font-black text-[#0a2342] tracking-tight">Order Status Tracker</h3>
            <p className="text-xs font-bold text-slate-400 mt-1">Live pipeline progression for your food order</p>
          </div>

          {/* Stepper Progression */}
          <div className="mb-6 flex items-center justify-between px-2">
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 z-10 ${isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : isCurrent
                        ? "bg-[#00c2cb] text-white ring-4 ring-[#00c2cb]/20 scale-110 shadow-lg"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                  >
                    {isCompleted ? "✓" : idx + 1}
                  </div>
                  <span className={`text-[10px] font-extrabold mt-2 whitespace-nowrap ${isCurrent ? "text-[#0a2342]" : "text-slate-400"
                    }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Message Card */}
          {liveStatus === "cancelled" ? (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center animate-fade-in">
              <div className="text-2xl mb-1">❌</div>
              <p className="text-xs font-black text-rose-700">Order Cancelled</p>
              <p className="text-[10px] text-rose-500 mt-1">Your order from {restaurantName} was cancelled. We're sorry for the inconvenience.</p>
            </div>
          ) : (
            <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
              <div className="text-xl mb-0.5">{STATUS_MESSAGES[liveStatus]?.emoji || "⏳"}</div>
              <p className="text-[11px] font-black text-[#0a2342]">{STATUS_MESSAGES[liveStatus]?.text || "Processing your order..."}</p>
            </div>
          )}

          {/* Details Card */}
          <div className="rounded-2xl bg-slate-50 p-4 mb-5 border border-slate-200/60 text-left text-xs font-semibold text-slate-500 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span>Order ID</span>
              <span className="text-[#0a2342] font-black">{orderId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span>Status</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                liveStatus === "cancelled" ? "bg-rose-100 text-rose-700" :
                liveStatus === "completed" ? "bg-emerald-100 text-emerald-800" :
                liveStatus === "arrived" ? "bg-purple-100 text-purple-800" :
                liveStatus === "picked_up" ? "bg-blue-100 text-blue-800" :
                "bg-amber-100 text-amber-800"
              }`}>
                {liveStatus.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span>Canteen / Vendor</span>
              <span className="text-[#0a2342] font-black">{restaurantName}</span>
            </div>
          </div>

          {/* ARRIVAL NUDGE OPTION FOR STUDENT — only when rider has arrived */}
          {liveStatus === "arrived" && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-2.5 items-center text-center animate-pulse">
              <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                <span>📍 Rider Has Arrived at Location!</span>
              </div>
              <p className="text-[11px] text-amber-700 font-medium leading-tight">
                Your delivery rider is waiting at the campus meetup point. Let them know you're on your way!
              </p>
              <button
                onClick={handleNudgeRiderArrival}
                disabled={riderNudgeSent}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <span>🏃‍♂️ Nudge Rider: "I'm on my way!"</span>
              </button>
              {riderNudgeSent && (
                <span className="text-[10px] font-black text-emerald-600 animate-bounce mt-1">
                  ✅ Arrival alert sent! Rider notified that you are heading over.
                </span>
              )}
            </div>
          )}

          {/* Nudge Feedback */}
          {nudgeStatus && (
            <p className="text-[11px] font-bold text-emerald-600 mb-3 animate-fade-in">
              {nudgeStatus}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            {/* Vendor Nudge Button — only visible in early stages */}
            {["pending", "accepted", "preparing"].includes(liveStatus) && (
              <button
                onClick={handleNudgeVendor}
                disabled={cooldown > 0}
                className={`w-full py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${cooldown > 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 cursor-pointer"
                  }`}
              >
                🔔 {cooldown > 0 ? `Vendor Nudge Cooldown (${cooldown}s)` : "Nudge Vendor for Update"}
              </button>
            )}

            {/* WhatsApp Action */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] transition-all duration-300"
            >
              💬 Track on WhatsApp
            </a>

            <button
              onClick={() => setIsTrackingOpen(false)}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-[#0a2342] rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer"
            >
              Close Dialog
            </button>
          </div>
        </div>
      </div>


      {/* RATING MODAL POPUP */}
      {showRatingModal && (
        <OrderRatingModal
          orderId={orderId}
          onClose={() => setShowRatingModal(false)}
          onSubmitSuccess={() => {
            setIsTrackingOpen(false);
          }}
        />
      )}
    </>
  );
}