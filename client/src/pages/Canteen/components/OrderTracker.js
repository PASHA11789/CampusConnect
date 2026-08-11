import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../../utils/helpers";
import OrderRatingModal from "../../../components/canteen/OrderRatingModal";
import { startArrivalAlertLoop, stopArrivalAlertLoop } from "../../../utils/audioAlert";
import { showOrderStatusNotification } from "../../../utils/browserNotification";


const STEPS = [
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "on_the_way", label: "On Way" },
  { id: "arrived", label: "Arrived" },
];

const STATUS_MESSAGES = {
  pending:    { emoji: "⏳", text: "Waiting for the vendor to accept your order..." },
  accepted:   { emoji: "✅", text: "Order accepted! Kitchen is preparing your meal." },
  preparing:  { emoji: "🍳", text: "Your food is being freshly prepared!" },
  ready:      { emoji: "🍱", text: "Food is ready! Rider is picking it up now." },
  picked_up:  { emoji: "🛵", text: "Your order is on its way to your location!" },
  on_the_way: { emoji: "🛵", text: "Your order is on its way to your location!" },
  arrived:    { emoji: "📍", text: "Your rider has arrived at the location!" },
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
  const [liveStatus, setLiveStatus] = useState("preparing");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [riderNudgeSent, setRiderNudgeSent] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Trigger continuous un-muteable 5s bell ring / 8s pause loop when liveStatus is arrived
  useEffect(() => {
    if (!isTrackingOpen) {
      stopArrivalAlertLoop();
      return;
    }
    const s = (liveStatus || "").toLowerCase().trim();
    if (s === "arrived") {
      startArrivalAlertLoop();
    } else {
      stopArrivalAlertLoop();
    }
    return () => {
      stopArrivalAlertLoop();
    };
  }, [liveStatus, isTrackingOpen]);

  const getCurrentStep = (status) => {
    const s = (status || "").toLowerCase().trim();
    if (s === "pending" || s === "accepted" || s === "preparing" || s === "placed" || s === "new") return 0;
    if (s === "ready" || s === "dispatched" || s === "food_ready" || s === "order_ready") return 1;
    if (s === "on_the_way" || s === "on-the-way" || s === "in_transit" || s === "picked_up" || s === "pickedup") return 2;
    if (s === "arrived" || s === "completed" || s === "delivered") return 3;
    return 0;
  };
  const currentStep = getCurrentStep(liveStatus);


  // Handle Socket & BroadcastChannel listener for order status updates & arrival pings
  useEffect(() => {
    if (!isTrackingOpen) return;

    const storedUser = (() => {
      try {
        return JSON.parse(sessionStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })();
    const effectiveStudentId = studentId || storedUser._id || storedUser.id;

    const updateStatusLocally = (newStatus, msg) => {
      setLiveStatus(newStatus);
      if (newStatus === "arrived") {
        setArrivalMessage(msg || "Rider has arrived at your location!");
        startArrivalAlertLoop();
      } else if (newStatus === "cancelled") {
        stopArrivalAlertLoop();
        setCancelMessage(msg || "Your order was cancelled by the restaurant.");
      } else if (newStatus === "completed" || newStatus === "delivered") {
        stopArrivalAlertLoop();
        setShowRatingModal(true);
      }
    };

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const joinStudentRoom = () => {
      if (effectiveStudentId) {
        socket.emit("join_room", effectiveStudentId.toString());
        socket.emit("join_user_room", effectiveStudentId.toString());
      }
    };

    socket.on("connect", joinStudentRoom);
    joinStudentRoom();

    socket.on("order_status_update", (data) => {
      if (!orderId || data.orderId === orderId) {
        updateStatusLocally(data.status, data.message);
        // Fire OS-level notification when browser is minimized
        showOrderStatusNotification(data.status, data.message);
      }
    });

    socket.on("order_arrived", (data) => {
      if (!orderId || data.orderId === orderId) {
        updateStatusLocally("arrived", data.message);
        showOrderStatusNotification("arrived", data.message);
      }
    });

    socket.on("order_delivered", (data) => {
      if (!orderId || data.orderId === orderId) {
        updateStatusLocally("completed", data.message);
        showOrderStatusNotification("completed", data.message);
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
      stopArrivalAlertLoop();
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

  const handleNotifyRiderComing = async () => {
    try {
      const channel = new BroadcastChannel("campus_connect_orders");
      channel.postMessage({
        type: "student_nudge_arrival",
        nudgeType: "student_coming",
        orderId: orderId,
        message: `🏃‍♂️ Student is heading to collect Order ${orderId} — they're on their way!`
      });
      channel.close();
    } catch (_) {}

    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      await axios.post(`/api/orders/${orderId}/nudge-rider`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRiderNudgeSent(true);
    } catch (err) {
      setRiderNudgeSent(true);
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

  if (!isTrackingOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#071A35]/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
        <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl sm:rounded-[32px] bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 text-center overflow-y-auto max-h-[90vh] my-auto">
          {/* Top Right Absolute Close Button */}
          <button
            onClick={() => setIsTrackingOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 text-xs font-black transition-all flex items-center justify-center cursor-pointer border border-slate-200/60 z-20"
            title="Close Tracker"
          >
            ✕
          </button>

          {/* Modal Header */}
          <div className="mb-4 sm:mb-5 text-center">
            <div className="mx-auto mb-2 sm:mb-2.5 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#071A35] text-[#00c2cb] text-lg sm:text-xl shadow-xs border border-[#00c2cb]/30">
              🛵
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0a2342] tracking-tight">Order Status Tracker</h3>
            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-0.5">Live progression updates for your food order</p>
          </div>

          {/* Stepper Progression with Connecting Bar */}
          <div className="mb-5 sm:mb-6 px-1 sm:px-2">
            <div className="relative flex items-center justify-between">
              {/* Connector Progress Bar */}
              <div className="absolute left-3 right-3 top-3.5 sm:top-4 h-1 bg-slate-100 -z-0">
                <div
                  className="h-full bg-[#00c2cb] transition-all duration-500 rounded-full"
                  style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-xs transition-all duration-300 ${
                        isCurrent
                          ? "bg-[#00c2cb] text-slate-950 ring-4 ring-[#00c2cb]/20 scale-110 shadow-md"
                          : isCompleted
                          ? "bg-[#071A35] text-white"
                          : "bg-white text-slate-400 border-2 border-slate-200"
                      }`}
                    >
                      {isCompleted && idx < currentStep ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-black mt-1 sm:mt-1.5 ${isCurrent ? "text-[#0a2342]" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Arrived Special Alert Banner */}
          {liveStatus === "arrived" && (
            <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-center shadow-lg border-2 border-amber-300 animate-pulse">
              <div className="text-3xl mb-1">📍</div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-200">
                Rider has arrived at delivery location!
              </p>
              <p className="text-[11px] font-semibold text-rose-100 mt-1">
                {arrivalMessage || "Your rider is waiting at the delivery spot. Please go collect your food!"}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={handleNotifyRiderComing}
                  className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 border border-amber-200"
                >
                  🏃 {riderNudgeSent ? "Rider Notified!" : "I'm Coming to Pick Up! (Notify Rider)"}
                </button>
              </div>
            </div>
          )}

          {/* Status Message Card */}
          {liveStatus === "cancelled" ? (
            <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center animate-fade-in">
              <div className="text-lg sm:text-xl mb-0.5">❌</div>
              <p className="text-xs font-black text-rose-700">Order Cancelled</p>
              <p className="text-[10px] text-rose-600 mt-0.5 leading-relaxed font-semibold">
                {cancelMessage || `Your order from ${restaurantName} was cancelled.`}
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[#071A35] via-[#0a2342] to-[#0079c2] text-white text-center shadow-md border border-white/10">
              <div className="text-lg sm:text-xl mb-1">{STATUS_MESSAGES[liveStatus]?.emoji || "⏳"}</div>
              <p className="text-[11px] sm:text-[11.5px] font-black tracking-wide text-[#00c2cb]">{STATUS_MESSAGES[liveStatus]?.text || "Processing your order..."}</p>
            </div>
          )}

          {/* Details Card */}
          <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 mb-4 border border-slate-200/80 text-left text-xs font-semibold text-slate-500 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span>Order ID</span>
              <span className="text-[#0a2342] font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">{orderId || "ORD-LIVE"}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span>Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                liveStatus === "cancelled" ? "bg-rose-100 text-rose-700" :
                liveStatus === "completed" ? "bg-emerald-100 text-emerald-800" :
                liveStatus === "arrived" ? "bg-purple-100 text-purple-800" :
                "bg-amber-100 text-amber-800"
              }`}>
                {liveStatus.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span>Canteen / Vendor</span>
              <span className="text-[#0a2342] font-black truncate max-w-[160px] sm:max-w-none">{restaurantName}</span>
            </div>
          </div>

          {/* ARRIVAL NUDGE OPTION FOR STUDENT */}
          {liveStatus === "arrived" && (
            <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-2 items-center text-center animate-pulse">
              <div className="flex items-center gap-1 text-amber-900 font-extrabold text-xs">
                <span>📍 Rider Has Arrived at Location!</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-700 font-medium leading-tight">
                {arrivalMessage || "Your delivery rider is waiting at the campus meetup point."}
              </p>
              <button
                onClick={handleNudgeRiderArrival}
                disabled={riderNudgeSent}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 border-none"
              >
                <span>🏃‍♂️ Nudge Rider: "I'm on my way!"</span>
              </button>
            </div>
          )}

          {/* Nudge Feedback */}
          {nudgeStatus && (
            <p className="text-[10.5px] font-bold text-emerald-600 mb-3 animate-fade-in">
              {nudgeStatus}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {["pending", "accepted", "preparing"].includes(liveStatus) && (
              <button
                onClick={handleNudgeVendor}
                disabled={cooldown > 0}
                className={`w-full py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 border-none shadow-xs ${cooldown > 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                  }`}
              >
                🔔 {cooldown > 0 ? `Vendor Nudge Cooldown (${cooldown}s)` : "Nudge Vendor for Update"}
              </button>
            )}

            {/* Student Cancel Option when Pending */}
            {liveStatus === "pending" && (
              <button
                onClick={async () => {
                  if (window.confirm("Are you sure you want to cancel this order?")) {
                    try {
                      setIsCancelling(true);
                      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
                      await axios.put(`/api/orders/${orderId}/cancel`, {
                        cancellationReason: "Cancelled by student"
                      }, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setLiveStatus("cancelled");
                      setCancelMessage("You have cancelled this order.");
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsCancelling(false);
                    }
                  }
                }}
                disabled={isCancelling}
                className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer border border-rose-200"
              >
                {isCancelling ? "Cancelling Order..." : "❌ Cancel Order"}
              </button>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs transition-all duration-300 no-underline"
            >
              💬 Track on WhatsApp
            </a>

            <button
              onClick={() => setIsTrackingOpen(false)}
              className="w-full py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl sm:rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer border-none"
            >
              Close Window
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