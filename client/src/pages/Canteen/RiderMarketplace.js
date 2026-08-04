import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";

const translations = {
  en: {
    portalTitle: "Rider Portal",
    welcome: "Welcome",
    online: "ONLINE (Active)",
    offline: "OFFLINE",
    logout: "Logout",
    activeDelivery: "Active Delivery in Progress",
    orderId: "Order ID",
    destination: "Destination",
    rewardTotal: "Reward / Total",
    liveStudentAlert: "Live Student Alert",
    headingOut: "Heading Out",
    statusWaiting: "Waiting for vendor to prepare food...",
    statusPreparing: "Vendor is preparing food 🍳",
    statusReady: "🍔 FOOD IS READY — Pick up now!",
    statusPickedUp: "🛵 Food picked up! Heading to student location",
    statusArrived: "📍 Arrived at location! Ringing student...",
    btnPickedUp: "🍔 Mark Picked Up — Food Ready!",
    btnWaitingReady: "⏳ Waiting for Vendor to Mark Ready...",
    btnFoodPickedUp: "✅ Food Picked Up",
    btnMarkArrived: "📍 Mark Arrived at Location",
    btnComplete: "✅ Mark Delivered & Complete Order",
    readyForDeliveries: "Ready for Deliveries",
    readyDesc: "Claim available order tickets below to start earning.",
    onlineReady: "Online & Ready",
    readyTickets: "Ready Order Tickets",
    ticketsAvailable: "Available",
    ticketsDesc: "Orders marked ready by vendors awaiting delivery riders.",
    refresh: "Refresh",
    loadingTickets: "Loading available tickets...",
    noTickets: "No Tickets Waiting Currently",
    noTicketsDesc: "When canteen vendors mark orders ready, new tickets will appear here automatically.",
    deliverTo: "Deliver to",
    deliveryReward: "Delivery Reward",
    acceptOrder: "Accept Order ➔",
    busyOrder: "Busy (Active Order)",
    goOnline: "Go Online",
    performance: "Delivery Performance",
    deliveries: "Deliveries",
    rating: "Rating",
    totalEarnings: "Total Earnings Today",
    history: "Delivery History",
    completed: "Completed",
    noCompleted: "No Completed Deliveries Yet",
    noCompletedDesc: "Delivered orders will appear here in your daily log.",
    delivered: "Delivered ✅",
    langLabel: "🌐 اردو",
    themeLight: "☀️ Light",
    themeDark: "🌙 Dark"
  },
  ur: {
    portalTitle: "رائڈر پورٹل",
    welcome: "خوش آمدید",
    online: "آن لائن (فعال)",
    offline: "آف لائن",
    logout: "لاگ آؤٹ",
    activeDelivery: "ڈیلیوری جاری ہے",
    orderId: "آرڈر نمبر",
    destination: "منزل / پتہ",
    rewardTotal: "معاوضہ / کل رقم",
    liveStudentAlert: "طالب علم کی لائیو اطلاع",
    headingOut: "آ رہا ہے",
    statusWaiting: "دکاندار کے کھانا تیار کرنے کا انتظار...",
    statusPreparing: "دکاندار کھانا تیار کر رہا ہے 🍳",
    statusReady: "🍔 کھانا تیار ہے — ابھی پک اپ کریں!",
    statusPickedUp: "🛵 کھانا لے لیا! طالب علم کی لوکیشن کی طرف جاری",
    statusArrived: "📍 لوکیشن پر پہنچ گئے! طالب علم کو گھنٹی بج رہی ہے...",
    btnPickedUp: "🍔 کھانا لے لیا — کھانا تیار ہے!",
    btnWaitingReady: "⏳ دکاندار کے تیار کرنے کا انتظار...",
    btnFoodPickedUp: "✅ کھانا اٹھا لیا گیا",
    btnMarkArrived: "📍 لوکیشن پر پہنچ گئے",
    btnComplete: "✅ ڈیلیوری مکمل کریں",
    readyForDeliveries: "ڈیلیوری کے لیے تیار",
    readyDesc: "کمانے کے لیے نیچے سے دستیاب آرڈر ٹکٹ منتخب کریں۔",
    onlineReady: "آن لائن اور تیار",
    readyTickets: "تیار آرڈرز کے ٹکٹ",
    ticketsAvailable: "دستیاب",
    ticketsDesc: "دکانداروں کے تیار کردہ آرڈرز جو رائڈر کے منتظر ہیں۔",
    refresh: "تازہ کریں",
    loadingTickets: "دستیاب ٹکٹ لوڈ ہو رہے ہیں...",
    noTickets: "فی الحال کوئی آرڈر منتظر نہیں",
    noTicketsDesc: "جب دکاندار آرڈر تیار کریں گے، تو نئے ٹکٹ خود بخود یہاں ظاہر ہوں گے۔",
    deliverTo: "پتہ",
    deliveryReward: "ڈیلیوری معاوضہ",
    acceptOrder: "آرڈر قبول کریں ➔",
    busyOrder: "مصروف (جاری آرڈر)",
    goOnline: "آن لائن ہوں",
    performance: "ڈیلیوری کی کارکردگی",
    deliveries: "کل ڈیلیوریز",
    rating: "ریٹنگ",
    totalEarnings: "آج کی کل آمدنی",
    history: "ڈیلیوری ہسٹری",
    completed: "مکمل",
    noCompleted: "آج ابھی تک کوئی ڈیلیوری مکمل نہیں ہوئی",
    noCompletedDesc: "مکمل شدہ آرڈرز آپ کے لاگ میں یہاں ظاہر ہوں گے۔",
    delivered: "ڈیلیور ہو گیا ✅",
    langLabel: "🌐 English",
    themeLight: "☀️ روشن",
    themeDark: "🌙 ڈارک"
  }
};

export default function RiderMarketplace() {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [tickets, setTickets] = useState([]);

  // Language & Theme State
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem("rider_lang") || "en"; } catch (_) { return "en"; }
  });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("rider_theme") || "light"; } catch (_) { return "light"; }
  });

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ur" : "en";
    setLang(nextLang);
    try { localStorage.setItem("rider_lang", nextLang); } catch (_) { }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try { localStorage.setItem("rider_theme", nextTheme); } catch (_) { }
  };

  const t = translations[lang] || translations.en;
  const isDark = theme === "dark";
  const [activeClaimedOrder, setActiveClaimedOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("active_claimed_order");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [studentComingAlert, setStudentComingAlert] = useState(null);
  const activeClaimedOrderRef = useRef(activeClaimedOrder);

  useEffect(() => {
    activeClaimedOrderRef.current = activeClaimedOrder;
    if (activeClaimedOrder) {
      localStorage.setItem("active_claimed_order", JSON.stringify(activeClaimedOrder));
    } else {
      localStorage.removeItem("active_claimed_order");
    }
  }, [activeClaimedOrder]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) { }
  };

  // Reset student coming alert whenever active order changes or status is not arrived
  useEffect(() => {
    const status = activeClaimedOrder?.status;
    if (!activeClaimedOrder || status !== "arrived") {
      setStudentComingAlert(null);
    }
  }, [activeClaimedOrder]);

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

    // Fetch rider active order from backend DB on mount / refresh
    useEffect(() => {
      const fetchActiveRiderOrder = async () => {
        const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
        if (!token) return;
        try {
          const { data } = await axios.get("http://localhost:5000/api/orders/marketplace/my-active", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (data && data.success && data.activeOrder) {
            setActiveClaimedOrder(data.activeOrder);
          }
        } catch (err) {
          console.error("Error loading active rider order:", err);
        }
      };
      fetchActiveRiderOrder();
    }, [rider]);

    useEffect(() => {
      fetchTickets();

      // Setup Socket connection to 'riders' room
      const socket = io(SOCKET_URL);

      const joinRiderRooms = () => {
        socket.emit("join_room", "riders");
        if (rider?._id) {
          socket.emit("join_user_room", rider._id.toString());
          socket.emit("join_room", rider._id.toString());
        }
      };

      socket.on("connect", () => {
        joinRiderRooms();
      });
      joinRiderRooms();

      // Handle incoming ticket broadcast from vendors
      socket.on("new_ticket", (data) => {
        if (!activeClaimedOrderRef.current) {
          playNotificationSound();
          showToast(`🚀 New Order Ticket: ${data.orderId}${data.urgent ? " — URGENT: Food Ready!" : ""}`, "info");
          fetchTickets();
        }
      });

      // Handle ticket claimed by another rider
      socket.on("ticket_accepted", ({ orderId }) => {
        setTickets((prev) => prev.filter((t) => t.orderId !== orderId));
      });

      // Handle vendor cancellation (clears active order if it matches)
      socket.on("ticket_cancelled", ({ orderId }) => {
        setTickets((prev) => prev.filter((t) => t.orderId !== orderId));
        setActiveClaimedOrder((prev) => {
          if (prev?.orderId === orderId) {
            showToast(`⚠️ Order ${orderId} was cancelled by the vendor.`, "error");
            localStorage.removeItem("active_claimed_order");
            return null;
          }
          return prev;
        });
      });

      // Vendor marked order as Ready for Pickup — broadcast to riders
      socket.on("order_ready_for_pickup", (data) => {
        playNotificationSound();
        showToast(`🍱 Order #${data.orderId} is READY for pickup at ${data.restaurantName || "the canteen"}! Pick it up now!`, "info");
        setActiveClaimedOrder((prev) =>
          prev?.orderId === data.orderId ? { ...prev, status: "ready" } : prev
        );
        fetchTickets();
      });

      // Handle arrival nudge from student
      socket.on("student_nudge_arrival", (data) => {
        playNotificationSound();
        showToast(`🏃‍♂️ Student Nudge: ${data.message || "Student is on their way to pick up the order!"}`, "warning");
        setStudentComingAlert(data);
      });

      // Handle status updates from backend (cancelled / completed)
      socket.on("order_status_update", (data) => {
        if (data.status === "cancelled") {
          setActiveClaimedOrder((prev) => {
            if (prev?.orderId === data.orderId) {
              showToast(`⚠️ Order ${data.orderId} was cancelled.`, "error");
              localStorage.removeItem("active_claimed_order");
              return null;
            }
            return prev;
          });
        } else if (data.status === "completed") {
          // Handles stale-state recovery: if backend confirms completion, clear the active panel
          setActiveClaimedOrder((prev) => {
            if (prev && (!data.orderId || prev.orderId === data.orderId)) {
              setCompletedDeliveries((cPrev) => [
                {
                  ...prev,
                  completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                },
                ...cPrev
              ]);
              showToast(`🎉 Order ${prev.orderId} confirmed delivered!`, "info");
              localStorage.removeItem("active_claimed_order");
              return null;
            }
            return prev;
          });
          fetchTickets();
        }
      });

      // BroadcastChannel listener for instant cross-tab notification
      let channel;
      try {
        channel = new BroadcastChannel("campus_connect_orders");
        channel.onmessage = (event) => {
          if (event.data && (event.data.type === "student_nudge_arrival" || event.data.status === "student_coming")) {
            playNotificationSound();
            showToast(`🏃‍♂️ Student Nudge: ${event.data.message || "Student is coming to pick up food!"}`, "warning");
            setStudentComingAlert({ message: event.data.message || "Student is on their way to pick up the order!" });
          }
        };
      } catch (e) { }

      return () => {
        socket.disconnect();
        if (channel) channel.close();
      };
    }, [rider]);

    const handleLogout = () => {
      sessionStorage.removeItem("riderToken");
      sessionStorage.removeItem("riderUser");
      navigate("/rider/login");
    };

    const [isProcessing, setIsProcessing] = useState(false);

    // Claim a Ticket (Step 1)
    const handleAcceptTicket = async (orderId) => {
      if (isProcessing || activeClaimedOrder) return;
      try {
        setIsProcessing(true);
        const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:5000/api/orders/${orderId}/accept-rider`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success) {
          showToast(`✅ Claimed Order ${orderId}! Wait for vendor to mark it ready.`, "info");
          const claimedOrder = res.data.order;
          setActiveClaimedOrder({
            ...claimedOrder,
            orderId: claimedOrder.orderId || orderId,
            status: claimedOrder.status || "accepted"
          });
          setTickets((prev) => prev.filter((t) => t.orderId !== orderId));
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to accept ticket";
        showToast(`❌ ${errMsg}`, "error");
      } finally {
        setIsProcessing(false);
      }
    };

    // Mark Order as Picked Up (Step 2 — after vendor marks 'ready')
    const handleMarkPickedUp = async (orderId) => {
      if (isProcessing) return;
      try {
        setIsProcessing(true);
        const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:5000/api/orders/${orderId}/pickup`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success) {
          showToast(`🛵 Order ${orderId} picked up! Now en route to student.`, "info");
          setActiveClaimedOrder(prev => ({ ...prev, status: "picked_up" }));
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to mark picked up";
        showToast(`❌ ${errMsg}`, "error");
      } finally {
        setIsProcessing(false);
      }
    };

    // Mark Order as Arrived (Step 3)
    const handleMarkArrived = async (orderId) => {
      if (isProcessing) return;
      try {
        setIsProcessing(true);
        const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:5000/api/orders/${orderId}/arrive`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success) {
          showToast(`📍 Arrival alert sent to student for order ${orderId}!`, "info");
          setActiveClaimedOrder(prev => ({ ...prev, status: "arrived" }));
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Failed to mark arrival";
        showToast(`❌ ${errMsg}`, "error");
      } finally {
        setIsProcessing(false);
      }
    };

    // Complete Delivery (Step 4)
    const handleCompleteOrder = async (orderId) => {
      if (isProcessing) return;
      try {
        setIsProcessing(true);
        const token = sessionStorage.getItem("riderToken") || sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await axios.put(
          `http://localhost:5000/api/orders/${orderId}/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data?.success) {
          showToast(`🎉 Order ${orderId} delivered! Great job!`, "info");
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
        showToast(`❌ ${errMsg}`, "error");
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className={`h-full overflow-y-auto min-h-screen font-sans flex flex-col relative pb-10 transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
        }`}>
        {/* Toast popup notification */}
        {toast && (
          <div className="fixed top-20 right-4 sm:right-6 z-[9999] bg-[#0a2342] text-white px-5 py-3 rounded-2xl shadow-2xl font-black text-xs border border-slate-700 animate-slide-down flex items-center gap-2 max-w-sm">
            <span>{toast.msg}</span>
          </div>
        )}

        {/* Top Navigation Header */}
        <header className={`border-b sticky top-0 z-40 backdrop-blur-md px-3 sm:px-8 py-2 sm:py-3 shadow-sm transition-colors duration-300 ${isDark ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-800"
          }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
            {/* Left Branding & Welcome */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-[#00c2cb] flex items-center justify-center text-base sm:text-xl font-black shadow-inner shrink-0">
                🛵
              </div>
              <div>
                <h1 className={`text-xs xs:text-sm sm:text-lg font-black tracking-tight leading-none whitespace-nowrap ${isDark ? "text-white" : "text-[#0a2342]"
                  }`}>
                  CampusConnect
                </h1>
                <p className="text-[9.5px] sm:text-[11px] font-bold text-slate-400 mt-0.5 whitespace-nowrap">
                  {t.welcome}, <span className={`font-black ${isDark ? "text-cyan-300" : "text-[#0a2342]"}`}>{rider?.name || "Rider Partner"}</span>
                </p>
              </div>
            </div>

            {/* Language, Theme, Online & Logout Controls */}
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border ${isDark
                  ? "bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700"
                  : "bg-cyan-50 border-cyan-200 text-[#00c2cb] hover:bg-cyan-100"
                  }`}
                title="Switch Language / زبان تبدیل کریں"
              >
                <span className="sm:hidden">{lang === "en" ? "🌐 اردو" : "🌐 EN"}</span>
                <span className="hidden sm:inline">{t.langLabel}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border ${isDark
                  ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                  }`}
                title="Toggle Light/Dark Theme"
              >
                <span className="sm:hidden">{isDark ? "☀️" : "🌙"}</span>
                <span className="hidden sm:inline">{isDark ? t.themeLight : t.themeDark}</span>
              </button>

              {/* Online Status Button */}
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border ${isOnline
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-ping" : "bg-rose-500"}`}></span>
                <span className="hidden sm:inline">{isOnline ? t.online : t.offline}</span>
                <span className="sm:hidden">{isOnline ? (lang === "ur" ? "آن لائن" : "ON") : (lang === "ur" ? "آف" : "OFF")}</span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black transition-all cursor-pointer border ${isDark
                  ? "bg-slate-800 border-slate-700 text-rose-400 hover:bg-rose-950/40"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-[#0a2342]"
                  }`}
              >
                {t.logout}
              </button>
            </div>
          </div>
        </header>

        {/* Toast System Alert Bar */}
        {message && (
          <div className="bg-cyan-50 border-b border-cyan-200 px-4 sm:px-6 py-2.5 text-xs font-black text-cyan-900 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-cyan-600 hover:text-cyan-900 font-bold text-sm cursor-pointer border-none bg-none">✕</button>
          </div>
        )}

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Left Column: Active Delivery & Ticket Feed */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* ── ACTIVE CLAIMED ORDER CARD ── */}
            {activeClaimedOrder ? (
              <div className={`rounded-3xl p-4 sm:p-6 border-2 border-[#00c2cb] shadow-xl relative overflow-hidden transition-colors ${isDark ? "bg-slate-900 border-[#00c2cb]" : "bg-white border-[#00c2cb]"
                }`}>
                <div className="absolute top-0 right-0 bg-[#00c2cb] text-[#0a2342] text-[8.5px] sm:text-[9.5px] font-black tracking-widest uppercase px-3 sm:px-4 py-1.5 rounded-bl-2xl">
                  {t.activeDelivery}
                </div>

                <div className="flex items-start gap-3.5 sm:gap-4 mb-4 sm:mb-5 pt-2">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl sm:text-3xl shrink-0 text-[#00c2cb]">
                    📦
                  </div>
                  <div>
                    <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-slate-400 tracking-wider">{t.orderId}</span>
                    <h2 className={`text-base sm:text-xl font-black leading-tight ${isDark ? "text-white" : "text-[#0a2342]"}`}>
                      Order #{activeClaimedOrder.orderId}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-bold mt-1">
                      {t.destination}: <span className="text-[#00c2cb] font-black">{activeClaimedOrder.deliveryLocation || "Campus Delivery Point"}</span>
                    </p>
                  </div>
                </div>

                {/* Order Info Bar */}
                <div className={`rounded-2xl p-3.5 sm:p-4 border mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2.5 text-xs ${isDark ? "bg-slate-800/80 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200/80 text-slate-700"
                  }`}>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#00c2cb] animate-pulse"></span>
                    Status: <span className="text-[#00c2cb] font-black uppercase tracking-wider text-[11px] sm:text-xs">{activeClaimedOrder.status?.replace("_", " ")}</span>
                  </div>
                  <div className="font-bold text-xs">
                    {t.rewardTotal}: <span className="text-emerald-500 font-black text-xs sm:text-sm">Rs. {activeClaimedOrder.totalAmount || 450}</span>
                  </div>
                </div>

                {/* Live Student Coming Alert Badge */}
                {studentComingAlert && activeClaimedOrder?.status === "arrived" && (
                  <div className="mb-4 sm:mb-5 p-3.5 sm:p-4 rounded-2xl bg-emerald-600 text-white font-black text-xs shadow-md animate-pulse flex items-center justify-between gap-3 border border-emerald-400">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="text-xl sm:text-2xl">🏃</span>
                      <div>
                        <div className="uppercase tracking-widest text-[8.5px] sm:text-[9px] text-emerald-200 font-black">{t.liveStudentAlert}</div>
                        <div className="text-[11px] sm:text-xs text-white font-black mt-0.5">{studentComingAlert.message || "Student is on their way to pick up the order!"}</div>
                      </div>
                    </div>
                    <span className="text-[8.5px] sm:text-[9px] bg-white text-emerald-700 px-2.5 sm:px-3 py-1 rounded-full font-black uppercase tracking-wider shrink-0">
                      {t.headingOut}
                    </span>
                  </div>
                )}

                {/* Delivery Progression Action Buttons */}
                <div className="space-y-2.5 sm:space-y-3">
                  {/* Status Guidance Banner */}
                  <div className={`flex items-center gap-2 text-[11px] sm:text-xs font-bold rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 border ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200/80 text-slate-700"
                    }`}>
                    <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${activeClaimedOrder.status === "accepted" ? "bg-amber-500 animate-pulse" :
                      activeClaimedOrder.status === "preparing" ? "bg-orange-500 animate-pulse" :
                        activeClaimedOrder.status === "ready" ? "bg-cyan-500 animate-bounce" :
                          activeClaimedOrder.status === "picked_up" ? "bg-blue-500 animate-pulse" :
                            activeClaimedOrder.status === "arrived" ? "bg-purple-500 animate-pulse" :
                              "bg-emerald-500"
                      }`}></span>
                    <span>
                      {activeClaimedOrder.status === "accepted" ? t.statusWaiting :
                        activeClaimedOrder.status === "preparing" ? t.statusPreparing :
                          activeClaimedOrder.status === "ready" ? t.statusReady :
                            activeClaimedOrder.status === "picked_up" ? t.statusPickedUp :
                              activeClaimedOrder.status === "arrived" ? t.statusArrived :
                                activeClaimedOrder.status?.replace("_", " ")}
                    </span>
                  </div>

                  {/* Step 1: Pick Up */}
                  <button
                    onClick={() => handleMarkPickedUp(activeClaimedOrder.orderId)}
                    disabled={isProcessing || activeClaimedOrder.status !== "ready"}
                    className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${activeClaimedOrder.status === "ready"
                      ? "bg-[#00c2cb] hover:bg-[#00b0b8] text-slate-950 shadow-cyan-500/20"
                      : isDark ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                  >
                    {activeClaimedOrder.status === "ready" ? t.btnPickedUp :
                      activeClaimedOrder.status === "accepted" || activeClaimedOrder.status === "preparing" ? t.btnWaitingReady :
                        t.btnFoodPickedUp}
                  </button>

                  {/* Step 2: Mark Arrived */}
                  <button
                    onClick={() => handleMarkArrived(activeClaimedOrder.orderId)}
                    disabled={isProcessing || activeClaimedOrder.status !== "picked_up"}
                    className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${activeClaimedOrder.status === "picked_up"
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                      : isDark ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                  >
                    {t.btnMarkArrived}
                  </button>

                  {/* Step 3: Complete Delivery */}
                  <button
                    onClick={() => handleCompleteOrder(activeClaimedOrder.orderId)}
                    disabled={isProcessing || activeClaimedOrder.status !== "arrived"}
                    className={`w-full py-3 sm:py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${activeClaimedOrder.status === "arrived"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 animate-pulse"
                      : isDark ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      }`}
                  >
                    {t.btnComplete}
                  </button>
                </div>

              </div>
            ) : (
              <div className={`rounded-3xl p-4 sm:p-6 border shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-800"
                }`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-lg sm:text-xl font-bold shrink-0">
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm sm:text-base font-black m-0 whitespace-nowrap ${isDark ? "text-white" : "text-[#0a2342]"}`}>{t.readyForDeliveries}</h3>
                    <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-0.5 m-0">{t.readyDesc}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-black whitespace-nowrap shrink-0">
                  {t.onlineReady}
                </span>
              </div>
            )}

            {/* ── AVAILABLE ORDER TICKETS FEED ── */}
            <div className={`rounded-3xl p-4 sm:p-6 border shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200/80 text-slate-800"
              }`}>
              <div className={`flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 mb-3 border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-100"
                }`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-sm sm:text-base font-black m-0 ${isDark ? "text-white" : "text-[#0a2342]"}`}>
                    🍔 {t.readyTickets}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[#00c2cb] text-[10px] sm:text-xs font-black border border-cyan-500/20 whitespace-nowrap">
                    {tickets.length} {t.ticketsAvailable}
                  </span>
                </div>

                <button
                  onClick={fetchTickets}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all cursor-pointer border shrink-0 ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                    }`}
                >
                  🔄 {t.refresh}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-400 mb-4">
                {t.ticketsDesc}
              </p>

              {loading ? (
                <div className="py-10 text-center text-slate-400 text-xs font-bold animate-pulse">
                  {t.loadingTickets}
                </div>
              ) : tickets.length === 0 ? (
                <div className={`py-10 text-center border-2 border-dashed rounded-3xl px-4 ${isDark ? "border-slate-800" : "border-slate-200"
                  }`}>
                  <div className="text-3xl sm:text-4xl mb-2">🛵</div>
                  <h4 className={`text-xs font-black ${isDark ? "text-white" : "text-[#0a2342]"}`}>{t.noTickets}</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-xs mx-auto">{t.noTicketsDesc}</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-3.5">
                  {tickets.map((tItem) => (
                    <div
                      key={tItem.orderId}
                      className={`p-3.5 sm:p-4.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm ${isDark ? "bg-slate-800/80 border-slate-700 hover:border-[#00c2cb]" : "bg-white border-slate-200 hover:border-[#00c2cb]"
                        }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-[#0a2342]"}`}>Order #{tItem.orderId}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10px] font-black border whitespace-nowrap ${tItem.status === "ready" || tItem.urgent
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}>
                            {tItem.status === "ready" || tItem.urgent ? "FOOD READY FOR PICKUP 🍱" : "IN PREPARATION 🍳"}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-1">
                          📍 {t.deliverTo}: <span className={`font-black ${isDark ? "text-cyan-300" : "text-[#0a2342]"}`}>{tItem.deliveryDestination || tItem.deliveryLocation || "Campus Gate"}</span>
                        </p>
                      </div>

                      <div className={`flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 ${isDark ? "border-slate-700" : "border-slate-100"
                        }`}>
                        <div className="text-left sm:text-right">
                          <div className="text-[9.5px] sm:text-[10px] font-black text-slate-400 uppercase">{t.deliveryReward}</div>
                          <div className="text-xs sm:text-sm font-black text-emerald-500">Rs. {tItem.totalAmount || 350}</div>
                        </div>

                        <button
                          onClick={() => handleAcceptTicket(tItem.orderId)}
                          disabled={!isOnline || !!activeClaimedOrder}
                          className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs shadow-sm transition-all cursor-pointer ${!isOnline || activeClaimedOrder
                            ? isDark ? "bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed" : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : "bg-[#00c2cb] hover:bg-[#00b0b8] text-slate-950 font-black"
                            }`}
                        >
                          {activeClaimedOrder ? t.busyOrder : isOnline ? t.acceptOrder : t.goOnline}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Earnings Summary & History */}
          <div className="space-y-6">

            {/* ── PERFORMANCE & EARNINGS CARD ── */}
            <div className={`rounded-3xl p-5 sm:p-6 border shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200/80 text-slate-800"
              }`}>
              <h3 className={`text-sm font-black mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-[#0a2342]"}`}>
                <span>📊 {t.performance}</span>
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200/80"}`}>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.deliveries}</div>
                  <div className={`text-2xl font-black mt-1 ${isDark ? "text-white" : "text-[#0a2342]"}`}>{completedDeliveries.length}</div>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200/80"}`}>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.rating}</div>
                  <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
                    <span>4.9</span>
                    <span className="text-base">⭐</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 sm:p-5 rounded-2xl border transition-colors ${isDark ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}>
                <div className={`text-[10px] font-black uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-700"
                  }`}>
                  {t.totalEarnings}
                </div>
                <div className={`text-xl sm:text-2xl font-black mt-1 ${isDark ? "text-emerald-300" : "text-emerald-700"
                  }`}>
                  Rs. {completedDeliveries.length * 80 + (completedDeliveries.length > 0 ? 150 : 0)}
                </div>
              </div>
            </div>

            {/* ── COMPLETED DELIVERIES HISTORY ── */}
            <div className={`rounded-3xl p-4 sm:p-6 border shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200/80 text-slate-800"
              }`}>
              <div className={`flex items-center justify-between mb-4 border-b pb-3 ${isDark ? "border-slate-800" : "border-slate-100"
                }`}>
                <h3 className={`text-sm sm:text-base font-black m-0 flex items-center gap-2 ${isDark ? "text-white" : "text-[#0a2342]"}`}>
                  <span>📜 {t.history}</span>
                </h3>
                <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border whitespace-nowrap ${isDark ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                  {completedDeliveries.length} {t.completed}
                </span>
              </div>

              {completedDeliveries.length === 0 ? (
                <div className={`py-8 text-center border-2 border-dashed rounded-2xl ${isDark ? "border-slate-800" : "border-slate-200"
                  }`}>
                  <div className="text-3xl mb-1.5">📜</div>
                  <h4 className={`text-xs font-black m-0 ${isDark ? "text-white" : "text-[#0a2342]"}`}>{t.noCompleted}</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 m-0">{t.noCompletedDesc}</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
                  {completedDeliveries.map((item, idx) => (
                    <div key={idx} className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200/80"
                      }`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black truncate ${isDark ? "text-white" : "text-[#0a2342]"}`}>Order #{item.orderId}</span>
                          <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 whitespace-nowrap">
                            +Rs. 80
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">
                          📍 {item.deliveryLocation || "Campus Delivery Point"} • {item.completedAt || "Just now"}
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap shrink-0">
                        {t.delivered}
                      </span>
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

