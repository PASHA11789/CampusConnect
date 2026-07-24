import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../../utils/helpers";
import OrderRatingModal from "../../../components/canteen/OrderRatingModal";

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
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/orders/${orderId}/nudge`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setNudgeStatus("🔔 Nudge sent to vendor!");
        setCooldown(180); // 3 minutes
      }
    } catch (err) {
      if (err.response?.status === 429) {
        const remaining = err.response.data.retryAfterSeconds || 180;
        setCooldown(remaining);
        setNudgeStatus(`Rate limited: Please wait ${remaining}s before nudging again.`);
      } else {
        setNudgeStatus("Failed to send nudge. Please try again.");
      }
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

          {/* Status Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">
            {liveStatus === "arrived" ? "🛵" : liveStatus === "completed" ? "⭐" : "🎉"}
          </div>

          {/* Title */}
          <h2 className="text-xl font-black text-[#0a2342] tracking-tight">Order Registered!</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1">
            Real-time order tracking & delivery notifications
          </p>

          {/* Live Arrival Banner */}
          {arrivalMessage && (
            <div className="mt-4 p-3 rounded-2xl bg-amber-500 text-white font-extrabold text-xs shadow-md animate-bounce">
              🔔 {arrivalMessage}
            </div>
          )}

          {/* Order Details Card */}
          <div className="my-5 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs font-bold text-slate-500 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span>Order ID</span>
              <span className="text-[#0a2342] font-black">{orderId}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
              <span>Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                {liveStatus}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span>Canteen / Vendor</span>
              <span className="text-[#0a2342] font-black">{restaurantName}</span>
            </div>
          </div>

          {/* Nudge Feedback */}
          {nudgeStatus && (
            <p className="text-[11px] font-bold text-emerald-600 mb-3 animate-fade-in">
              {nudgeStatus}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            {/* Nudge Button */}
            <button
              onClick={handleNudgeVendor}
              disabled={cooldown > 0}
              className={`w-full py-3.5 rounded-2xl text-xs font-black tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${cooldown > 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 cursor-pointer"
                }`}
            >
              🔔 {cooldown > 0 ? `Nudge Cooldown (${cooldown}s)` : "Nudge Vendor for Update"}
            </button>

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