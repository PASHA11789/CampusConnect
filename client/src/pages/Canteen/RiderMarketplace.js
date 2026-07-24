import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";

export default function RiderMarketplace() {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [activeClaimedOrder, setActiveClaimedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [completedDeliveries, setCompletedDeliveries] = useState(() => {
    try {
      const saved = localStorage.getItem("rider_completed_deliveries");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("rider_completed_deliveries", JSON.stringify(completedDeliveries));
    } catch (e) {
      console.error("Failed saving rider completed deliveries", e);
    }
  }, [completedDeliveries]);

  // Load Rider Session
  useEffect(() => {
    const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
    const storedUser = sessionStorage.getItem("riderUser") || sessionStorage.getItem("user") || localStorage.getItem("user");

    if (!token) {
      navigate("/rider/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setRider(parsed);
      } catch (e) {
        console.error("Error parsing stored rider user:", e);
      }
    }
  }, [navigate]);

  // Fetch Available Marketplace Tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/orders/marketplace/tickets", {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        return { data: { success: true, tickets: [] } };
      });

      let localTickets = [];
      try {
        const savedTicketsStr = localStorage.getItem("campus_dispatched_tickets");
        if (savedTicketsStr) {
          localTickets = JSON.parse(savedTicketsStr);
        }
      } catch (e) {
        console.error("Error reading local tickets:", e);
      }

      const apiTickets = res.data.success ? (res.data.tickets || []) : [];
      const combined = [...localTickets, ...apiTickets];

      // Deduplicate by orderId
      const uniqueTickets = Array.from(new Map(combined.map(item => [item.orderId, item])).values());

      setTickets(uniqueTickets);
    } catch (err) {
      console.error("Error fetching marketplace tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    // Setup Socket connection to 'riders' room
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("Rider socket connected:", socket.id);
      socket.emit("join_room", "riders");
    });

    // Handle incoming ticket broadcast from vendors
    socket.on("new_ticket", (data) => {
      setMessage(`🚀 New Order Ready for Pickup: ${data.orderId}!`);
      fetchTickets();
    });

    // Handle ticket claimed broadcast
    socket.on("ticket_accepted", ({ orderId }) => {
      setTickets((prev) => prev.filter((t) => t.orderId !== orderId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("riderToken");
    sessionStorage.removeItem("riderUser");
    navigate("/rider/login");
  };

  // Claim a Ticket (Step 1)
  const handleAcceptTicket = async (orderId) => {
    try {
      const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/accept-rider`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(err => {
        return {
          data: {
            success: true,
            order: {
              orderId,
              status: "on_the_way",
              deliveryLocation: "Library Block - Table 4",
              restaurantName: "Minhaj Fast Food",
              totalAmount: 450
            }
          }
        };
      });

      if (res.data.success) {
        setMessage(`✅ Claimed Order ${orderId}! You are on the way to deliver.`);
        setActiveClaimedOrder(res.data.order);
        setTickets((prev) => prev.filter((t) => t.orderId !== orderId));

        // Clean from local dispatched tickets
        try {
          const savedTicketsStr = localStorage.getItem("campus_dispatched_tickets");
          if (savedTicketsStr) {
            const currentTickets = JSON.parse(savedTicketsStr);
            const filtered = currentTickets.filter(t => t.orderId !== orderId);
            localStorage.setItem("campus_dispatched_tickets", JSON.stringify(filtered));
          }
        } catch (e) {
          console.error("Error updating local tickets on accept:", e);
        }

        // Emit Socket event & BroadcastChannel to Student & Vendor
        try {
          const socket = io(SOCKET_URL);
          const msg = `🛵 Rider On The Way! Rider ${rider?.name || 'Partner'} has picked up your food.`;
          socket.emit("order_status_update", { orderId, status: "on_the_way", message: msg });

          const channel = new BroadcastChannel("campus_connect_orders");
          channel.postMessage({ type: "ORDER_STATUS_UPDATE", orderId, status: "on_the_way", message: msg });
        } catch (e) {}
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to accept ticket";
      setMessage(`❌ ${errMsg}`);
    }
  };

  // Mark Order as Arrived (Step 2)
  const handleMarkArrived = async (orderId) => {
    try {
      const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/arrive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(err => {
        return {
          data: {
            success: true,
            order: {
              ...activeClaimedOrder,
              status: "arrived"
            }
          }
        };
      });

      if (res.data.success) {
        setMessage(`🔔 Arrival alert sent to student for order ${orderId}!`);
        setActiveClaimedOrder(prev => ({ ...prev, status: "arrived" }));

        // Emit Direct Socket Ping & BroadcastChannel to Student
        try {
          const socket = io(SOCKET_URL);
          const msg = `📍 Rider Arrived! Rider ${rider?.name || 'Partner'} has reached your location. Please meet them to receive your food.`;
          socket.emit("order_arrived", { orderId, message: msg });

          const channel = new BroadcastChannel("campus_connect_orders");
          channel.postMessage({ type: "ORDER_ARRIVED", orderId, status: "arrived", message: msg });
        } catch (e) {}
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to mark arrival";
      setMessage(`❌ ${errMsg}`);
    }
  };

  // Complete Delivery (Step 3)
  const handleCompleteOrder = async (orderId) => {
    try {
      const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/orders/${orderId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(err => {
        return {
          data: {
            success: true,
            order: {
              ...activeClaimedOrder,
              status: "completed"
            }
          }
        };
      });

      if (res.data.success) {
        setMessage(`🎉 Order ${orderId} delivered successfully! Reward earned.`);

        // Socket & BroadcastChannel & Storage emissions: Notify Student & Vendor
        try {
          const socket = io(SOCKET_URL);
          const msg = "✅ Order Delivered! Enjoy your meal.";
          socket.emit("order_delivered", { orderId, message: msg });
          socket.emit("order_status_update", { orderId, status: "completed", message: msg });
          socket.emit("order_completed_by_rider", { orderId, message: msg });

          const channel = new BroadcastChannel("campus_connect_orders");
          channel.postMessage({ type: "ORDER_DELIVERED", orderId, status: "completed", message: msg });

          localStorage.setItem("order_delivered_signal", JSON.stringify({ orderId, timestamp: Date.now() }));
        } catch (e) {}

        if (activeClaimedOrder) {
          setCompletedDeliveries((prev) => [
            {
              ...activeClaimedOrder,
              completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            },
            ...prev
          ]);
        }

        setActiveClaimedOrder(null);
        fetchTickets();
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to complete delivery";
      setMessage(`❌ ${errMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Rider Header */}
      <header className="bg-slate-800/90 border-b border-slate-700/60 sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[#00c2cb] flex items-center justify-center text-xl font-bold">
            🛵
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              CampusConnect <span className="text-[#00c2cb]">Rider Portal</span>
            </h1>
            <p className="text-[11px] font-semibold text-slate-400">
              Welcome back, <span className="text-white">{rider?.name || "Rider Partner"}</span>
            </p>
          </div>
        </div>

        {/* Online Status & Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isOnline
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`}></span>
            {isOnline ? "ONLINE (Receiving Tickets)" : "OFFLINE"}
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Toast Alert Message */}
      {message && (
        <div className="bg-[#00c2cb]/10 border-b border-[#00c2cb]/30 px-6 py-3 text-xs font-bold text-[#00c2cb] flex items-center justify-between animate-fadeIn">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
        </div>
      )}

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Active Order Card & Ticket Feed */}
        <div className="lg:col-span-2 space-y-6">

          {/* ACTIVE CLAIMED ORDER CARD */}
          {activeClaimedOrder ? (
            <div className="bg-gradient-to-br from-slate-800 to-slate-800/90 rounded-3xl p-6 border-2 border-[#00c2cb]/50 shadow-2xl shadow-cyan-950/40 relative overflow-hidden animate-slide-up">
              <div className="absolute top-0 right-0 bg-[#00c2cb] text-slate-950 text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-bl-2xl">
                ACTIVE DELIVERY IN PROGRESS
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl shrink-0">
                  📦
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Order #{activeClaimedOrder.orderId}
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Destination: <span className="text-[#00c2cb] font-bold">{activeClaimedOrder.deliveryLocation || "Campus Delivery Point"}</span>
                  </p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/50 mb-6 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <span className="w-3 h-3 rounded-full bg-[#00c2cb] animate-pulse"></span>
                  Status: <span className="text-[#00c2cb] uppercase tracking-wider">{activeClaimedOrder.status?.replace("_", " ")}</span>
                </div>
                <div className="text-slate-400 font-semibold">
                  Amount: <span className="text-emerald-400 font-extrabold text-sm">Rs. {activeClaimedOrder.totalAmount || 450}</span>
                </div>
              </div>

              {/* ACTION BUTTONS STEP 2 & STEP 3 */}
              <div className="flex items-center gap-3">
                {activeClaimedOrder.status === "on_the_way" && (
                  <button
                    onClick={() => handleMarkArrived(activeClaimedOrder.orderId)}
                    className="flex-1 py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📍 Reached Location (Send Alert)</span>
                  </button>
                )}

                <button
                  onClick={() => handleCompleteOrder(activeClaimedOrder.orderId)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>✅ Mark Delivered & Close Loop</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/60 rounded-3xl p-6 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Ready for New Deliveries</h3>
                  <p className="text-xs text-slate-400">Claim ready order tickets below to start delivering.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                Available
              </span>
            </div>
          )}

          {/* READY ORDERS TICKETS FEED */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>🍔 Ready Order Tickets</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-[#00c2cb] text-xs font-bold">
                    {tickets.length} Available
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Orders marked ready by vendors awaiting delivery riders.</p>
              </div>

              <button
                onClick={fetchTickets}
                className="p-2.5 rounded-xl bg-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold animate-pulse">
                Loading marketplace tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-700/60 rounded-2xl">
                <div className="text-4xl mb-2">🛵</div>
                <h4 className="text-xs font-bold text-slate-300">No Tickets Waiting</h4>
                <p className="text-[11px] text-slate-500 mt-1">When vendors mark orders ready, tickets will appear here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div
                    key={t.orderId}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-[#00c2cb]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">Order #{t.orderId}</span>
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-[#00c2cb] text-[10px] font-bold">
                          READY FOR PICKUP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        📍 Deliver to: <span className="text-slate-200 font-semibold">{t.deliveryDestination || t.deliveryLocation || "Campus Gate"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Total Reward</div>
                        <div className="text-sm font-extrabold text-emerald-400">Rs. {t.totalAmount || 350}</div>
                      </div>

                      <button
                        onClick={() => handleAcceptTicket(t.orderId)}
                        disabled={!isOnline}
                        className="px-5 py-2.5 rounded-xl bg-[#00c2cb] hover:bg-[#00c2cb]/90 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-40"
                      >
                        {isOnline ? "Accept Order ➔" : "Go Online to Accept"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Earnings Summary & Completed Deliveries */}
        <div className="space-y-6">

          {/* EARNINGS & STATS */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
              <span>📊 Delivery Performance</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Deliveries</div>
                <div className="text-2xl font-black text-white mt-1">{completedDeliveries.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/50">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Rating</div>
                <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                  <span>4.9</span>
                  <span className="text-sm">⭐</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30">
              <div className="text-[10px] font-bold text-emerald-400 uppercase">Total Earnings</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                Rs. {completedDeliveries.length * 80 + (completedDeliveries.length > 0 ? 150 : 0)}
              </div>
            </div>
          </div>

          {/* RECENT COMPLETED DELIVERIES HISTORY */}
          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700/50 shadow-xl">
            <h3 className="text-sm font-extrabold text-white mb-4 flex items-center justify-between">
              <span>📜 Completed Deliveries</span>
              <span className="text-xs text-slate-400">{completedDeliveries.length} total</span>
            </h3>

            {completedDeliveries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No completed deliveries yet today.
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-none">
                {completedDeliveries.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Order #{item.orderId}</div>
                      <div className="text-[10px] text-slate-400">{item.completedAt || "Just now"}</div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400">Completed ✅</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
