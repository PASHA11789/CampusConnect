import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";
import AnimatedSelect from "../../components/common/AnimatedSelect";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard"); // dashboard, orders, menu, profile, settings
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState("Canteen");
  const [vendorUser, setVendorUser] = useState({ name: "Vendor", email: "" });
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newNotifications, setNewNotifications] = useState(0);
  const [orderSubTab, setOrderSubTab] = useState("active"); // "active" or "completed"
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = React.useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Audio Notification Sound (double chime) using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = (time, freq, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };
      const now = audioCtx.currentTime;
      playBeep(now, 523.25, 0.15); // C5
      playBeep(now + 0.15, 659.25, 0.25); // E5
    } catch (err) {
      console.error("Failed to play notification sound", err);
    }
  };

  const [restaurantAddress, setRestaurantAddress] = useState("");

  const [registeredRiders, setRegisteredRiders] = useState(() => {
    try {
      const savedRiders = localStorage.getItem("registered_campus_riders");
      return savedRiders ? JSON.parse(savedRiders) : [];
    } catch (e) {
      return [];
    }
  });

  const handleRemoveRider = (targetIdOrIdx) => {
    const updated = registeredRiders.filter((r, idx) => (r.id ? r.id !== targetIdOrIdx : idx !== targetIdOrIdx));
    setRegisteredRiders(updated);
    try {
      localStorage.setItem("registered_campus_riders", JSON.stringify(updated));
    } catch (e) { }
    showToast("Delivery Rider removed from your restaurant fleet.", "info");
  };

  const fetchDashboardData = async (token) => {
    try {
      // 1. Fetch vendor's restaurant profile
      const res = await axios.get("/api/vendor/restaurant", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const rest = res.data.restaurant;
        setSelectedRestaurant(rest.name);
        setRestaurantOpen(rest.isActive);
        setRestaurantAddress(rest.address || "");
        setVendorUser({
          name: rest.name,
          email: rest.owner?.email || rest.email || "",
          phone: rest.phone || "",
          avatar: rest.coverImage || rest.owner?.avatar || rest.avatar || ""
        });

        const mappedMenu = (rest.menu || []).map(item => ({
          id: item._id,
          name: item.name,
          category: item.category || "Burgers",
          price: item.price,
          status: item.isAvailable ? "Active" : "Inactive",
          description: item.description,
          image: item.image
        }));
        setMenu(mappedMenu);
      }

      // 2. Fetch vendor's order queue
      const ordersRes = await axios.get("/api/vendor/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ordersRes.data.success) {
        const mappedOrders = (ordersRes.data.orders || []).map(order => ({
          id: order.orderId || order._id,
          rawId: order._id,
          orderId: order.orderId || order._id,
          studentName: order.student?.name || "Student",
          avatar: order.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.student?.name || "Student")}&background=random`,
          phone: order.studentPhone || "+923000000000",
          items: order.items.map(item => `${item.name} x${item.quantity}`).join(", "),
          itemsList: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.totalAmount,
          time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: order.status,
          location: order.deliveryLocation || "Main Campus",
          createdAt: new Date(order.createdAt)
        }));
        mappedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(mappedOrders);
      }

      // 3. Fetch vendor's riders from backend API
      try {
        const ridersRes = await axios.get("/api/vendor/riders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ridersRes.data.success && ridersRes.data.riders) {
          const mappedRiders = ridersRes.data.riders.map(r => ({
            id: r._id,
            name: r.name,
            email: r.email,
            phone: r.riderPhone || r.phone || "",
            vehicle: r.vehicle || "Motorcycle",
            status: r.riderStatus || "Online",
            regNo: r.registeration_number
          }));
          setRegisteredRiders(mappedRiders);
        }
      } catch (rErr) {
        console.error("Error loading riders from API", rErr);
      }
    } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  // Load auth info and start Socket.io connection on mount
  useEffect(() => {
    const token = sessionStorage.getItem("vendorToken");
    const infoStr = sessionStorage.getItem("vendorInfo");
    if (!token) {
      navigate("/vendor/login");
      return;
    }

    let info = {};
    if (infoStr) {
      try {
        info = JSON.parse(infoStr);
        setVendorUser(info);
        if (info.restaurantName) {
          setSelectedRestaurant(info.restaurantName);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetchDashboardData(token);

    const effectiveVendorId = info._id || info.id || info.user?._id;

    // Initialize Socket.io connection with resilient transports
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const joinVendorRoom = () => {
      const vId = effectiveVendorId || info._id || info.id;
      if (vId) {
        socket.emit("join_user_room", vId.toString());
        socket.emit("join_room", vId.toString());
        console.log(`Vendor joined private room: ${vId}`);
      }
    };

    socket.on("connect", joinVendorRoom);
    joinVendorRoom();

    socket.on("new_vendor_order", (newOrder) => {
      const mapped = {
        id: newOrder.orderId || newOrder._id,
        rawId: newOrder._id,
        orderId: newOrder.orderId || newOrder._id,
        studentName: newOrder.student?.name || "Student",
        avatar: newOrder.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newOrder.student?.name || "Student")}&background=random`,
        phone: newOrder.studentPhone || "+923000000000",
        items: newOrder.items.map(item => `${item.name} x${item.quantity}`).join(", "),
        itemsList: newOrder.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: newOrder.totalAmount,
        time: new Date(newOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "pending",
        location: newOrder.deliveryLocation || "Main Campus",
        createdAt: new Date(newOrder.createdAt)
      };

      setOrders(prev => [mapped, ...prev]);
      setNewNotifications(prev => prev + 1);
      playNotificationSound();
      showToast(`New order received from ${newOrder.student?.name || "Student"}!`, "success");
    });

    socket.on("order_nudge", (data) => {
      playNotificationSound();
      showToast(`Nudge Alert! Student is asking for update on Order ${data.orderId}`, "warning");
    });

    // Rider accepted a ticket
    socket.on("rider_accepted_order", (data) => {
      showToast(`Rider accepted Order ${data.orderId}! (${data.riderName || "Rider"})`, "info");
      setOrders(prev => prev.map(o =>
        o.orderId === data.orderId ? { ...o, riderName: data.riderName } : o
      ));
    });

    // Ticket was cancelled (e.g., removed from pool)
    socket.on("ticket_cancelled", (data) => {
      setOrders(prev => prev.map(o =>
        o.orderId === data.orderId ? { ...o, status: "cancelled" } : o
      ));
    });

    // Generic status updates (from rider actions: picked_up, arrived, completed)
    socket.on("order_status_update", (data) => {
      const targetId = data?.orderId;
      setOrders(prev =>
        prev.map(o =>
          o.orderId === targetId ? { ...o, status: data.status } : o
        )
      );
      if (data.status === "picked_up") {
        showToast(`Rider picked up Order ${targetId}! En route to student.`, "info");
      } else if (data.status === "arrived") {
        showToast(`Rider arrived with Order ${targetId}!`, "info");
      }
    });

    socket.on("order_completed_by_rider", (data) => {
      const targetId = data?.orderId;
      playNotificationSound();
      showToast(`Order ${targetId || ""} delivered & completed by rider!`, "success");
      setOrders(prev =>
        prev.map(o =>
          o.orderId === targetId ? { ...o, status: "completed" } : o
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, showToast]);

  // --- Order Status Updates (Stage-Locked) ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = sessionStorage.getItem("vendorToken") || localStorage.getItem("token");
    try {
      const res = await axios.put(`/api/vendor/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setOrders(prev =>
          prev.map(o => o.orderId === orderId || o.id === orderId ? { ...o, status: newStatus } : o)
        );
        playNotificationSound();

        const messages = {
          accepted: `Order ${orderId} accepted! Rider ticket dispatched to marketplace.`,
          preparing: `Order ${orderId} is now being prepared.`,
          ready: `Order ${orderId} is ready! Rider has been alerted.`,
          cancelled: `Order ${orderId} has been cancelled.`
        };
        showToast(messages[newStatus] || `Order ${orderId} updated to: ${newStatus}`, newStatus === "cancelled" ? "error" : "success");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to update order status";
      showToast(errMsg, "error");
      console.error(err);
    }
  };

  // --- Order Cancellation Modal State & Handlers ---
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("Out of Stock / Ingredients");
  const [cancelReasonCustom, setCancelReasonCustom] = useState("");
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);

  const handleOpenCancelModal = (order) => {
    setCancelModalOrder(order);
    setCancelReasonPreset("Out of Stock / Ingredients");
    setCancelReasonCustom("");
  };

  const handleCloseCancelModal = () => {
    if (isCancellingOrder) return;
    setCancelModalOrder(null);
    setCancelReasonCustom("");
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const targetOrderId = cancelModalOrder.orderId || cancelModalOrder.id || cancelModalOrder.rawId;
    const reason = cancelReasonCustom.trim() || cancelReasonPreset;
    const token = sessionStorage.getItem("vendorToken") || localStorage.getItem("token");

    try {
      setIsCancellingOrder(true);
      const res = await axios.put(`/api/vendor/orders/${targetOrderId}/status`, {
        status: "cancelled",
        cancellationReason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setOrders(prev =>
          prev.map(o => (o.orderId === targetOrderId || o.id === targetOrderId ? { ...o, status: "cancelled" } : o))
        );
        playNotificationSound();
        showToast(`Order ${targetOrderId} cancelled immediately. Student and rider notified.`, "error");
        setCancelModalOrder(null);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to cancel order";
      showToast(errMsg, "error");
      console.error(err);
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("Burgers");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemStatus, setItemStatus] = useState("Active");
  const [itemImage, setItemImage] = useState("");
  const [itemImageFile, setItemImageFile] = useState(null);

  // Open modal to add a new item
  const handleAddNewItemClick = () => {
    setEditingItem(null);
    setItemName("");
    setItemCategory("Burgers");
    setItemPrice("");
    setItemDescription("");
    setItemStatus("Active");
    setItemImage("");
    setItemImageFile(null);
    setIsMenuModalOpen(true);
  };

  // Open modal to edit an item
  const handleEditItemClick = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemPrice(item.price);
    setItemDescription(item.description || "");
    setItemStatus(item.status);
    setItemImage(item.image || "");
    setItemImageFile(null);
    setIsMenuModalOpen(true);
  };

  // Delete menu item
  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      const token = sessionStorage.getItem("vendorToken");
      try {
        const { data } = await axios.delete(`/api/vendor/menu/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setMenu(menu.filter((item) => item.id !== itemId));
          showToast("Menu item deleted successfully!", "success");
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to delete menu item", "error");
      }
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = sessionStorage.getItem("vendorToken");
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const { data } = await axios.put("/api/vendor/auth/update-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (data.avatar) {
        const updatedUser = { ...vendorUser, avatar: data.avatar };
        setVendorUser(updatedUser);
        sessionStorage.setItem("vendorInfo", JSON.stringify(updatedUser));
        showToast("Profile picture updated successfully!", "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile picture.", "error");
    }
  };

  // Rider Management Modal State
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState(null);
  const [riderFormName, setRiderFormName] = useState("");
  const [riderFormEmail, setRiderFormEmail] = useState("");
  const [riderFormPhone, setRiderFormPhone] = useState("");
  const [riderFormRegNo, setRiderFormRegNo] = useState("");
  const [riderFormVehicle, setRiderFormVehicle] = useState("Motorcycle");
  const [riderFormStatus, setRiderFormStatus] = useState("Online");
  const [riderFormPassword, setRiderFormPassword] = useState("");

  const handleOpenAddRiderModal = () => {
    setEditingRider(null);
    setRiderFormName("");
    setRiderFormEmail("");
    setRiderFormPhone("");
    setRiderFormRegNo(`RIDER-${Date.now().toString().slice(-4)}`);
    setRiderFormVehicle("Motorcycle");
    setRiderFormStatus("Online");
    setRiderFormPassword("password123");
    setIsRiderModalOpen(true);
  };

  const handleOpenEditRiderModal = (rider) => {
    setEditingRider(rider);
    setRiderFormName(rider.name || "");
    setRiderFormEmail(rider.email || "");
    setRiderFormPhone(rider.phone || "");
    setRiderFormRegNo(rider.regNo || rider.registeration_number || "");
    setRiderFormVehicle(rider.vehicle || "Motorcycle");
    setRiderFormStatus(rider.status || "Online");
    setRiderFormPassword("");
    setIsRiderModalOpen(true);
  };

  const handleSaveRiderSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("vendorToken") || localStorage.getItem("token");

    try {
      if (editingRider) {
        const res = await axios.put(`/api/vendor/riders/${editingRider.id}`, {
          name: riderFormName,
          email: riderFormEmail,
          phone: riderFormPhone,
          vehicle: riderFormVehicle,
          riderStatus: riderFormStatus,
          password: riderFormPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          showToast("Delivery Rider updated successfully!", "success");
          fetchDashboardData(token);
        }
      } else {
        const res = await axios.post("/api/vendor/riders", {
          name: riderFormName,
          email: riderFormEmail,
          phone: riderFormPhone,
          registeration_number: riderFormRegNo,
          vehicle: riderFormVehicle,
          password: riderFormPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          showToast("New Delivery Rider created successfully!", "success");
          fetchDashboardData(token);
        }
      }
      setIsRiderModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save rider.", "error");
    }
  };

  const handleDeleteRider = async (riderId) => {
    if (!window.confirm("Are you sure you want to delete this rider account from database?")) return;
    const token = sessionStorage.getItem("vendorToken") || localStorage.getItem("token");

    try {
      const res = await axios.delete(`/api/vendor/riders/${riderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast("Rider account deleted from database.", "info");
        fetchDashboardData(token);
      }
    } catch (err) {
      console.error(err);
      handleRemoveRider(riderId);
    }
  };

  // Handle Save (Create or Update) Menu Item
  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemPrice) {
      showToast("Name and Price are required.", "warning");
      return;
    }

    const defaultImages = {
      Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=150&auto=format&fit=crop",
      Pasta: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=150&auto=format&fit=crop",
      Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=150&auto=format&fit=crop",
      Beverages: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=150&auto=format&fit=crop",
      Desserts: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=150&auto=format&fit=crop"
    };

    const finalImage = itemImage || defaultImages[itemCategory] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop";
    const token = sessionStorage.getItem("vendorToken");

    const formData = new FormData();
    formData.append("name", itemName);
    formData.append("price", Number(itemPrice));
    formData.append("description", itemDescription);
    formData.append("category", itemCategory);
    formData.append("isAvailable", itemStatus === "Active");

    if (itemImageFile) {
      formData.append("image", itemImageFile);
    } else {
      formData.append("image", finalImage);
    }

    try {
      if (editingItem) {
        const { data } = await axios.put(`/api/vendor/menu/${editingItem.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        if (data.success) {
          await fetchDashboardData(token);
          showToast("Menu item updated successfully!", "success");
        }
      } else {
        const { data } = await axios.post("/api/vendor/menu", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
        if (data.success) {
          await fetchDashboardData(token);
          showToast("Menu item added successfully!", "success");
        }
      }
      setIsMenuModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save menu item", "error");
    }
  };

  const handleSaveVendorProfile = async (e) => {
    if (e) e.preventDefault();
    const token = sessionStorage.getItem("vendorToken");
    try {
      const payload = {
        name: selectedRestaurant,
        coverImage: vendorUser.avatar,
        phone: vendorUser.phone,
        email: vendorUser.email,
        address: restaurantAddress
      };
      const { data } = await axios.put("/api/vendor/restaurant", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        showToast("Vendor profile & restaurant details updated in database!", "success");
        fetchDashboardData(token);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    }
  };

  // Toggle restaurant open/close status
  const handleToggleRestaurantOpen = async () => {
    const token = sessionStorage.getItem("vendorToken");
    try {
      const { data } = await axios.put("/api/vendor/restaurant/status", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setRestaurantOpen(data.isActive);
        showToast(`Restaurant is now ${data.isActive ? "Open" : "Closed"}!`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle restaurant status", "error");
    }
  };

  // --- Statistics Calculation ---
  const activeOrdersList = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const completedOrdersList = orders.filter((o) => o.status === 'completed');
  const cancelledOrdersList = orders.filter((o) => o.status === 'cancelled');
  const activeOrdersCount = activeOrdersList.length;
  const todayOrders = orders.filter((o) => o.status !== 'cancelled').length;
  const todayRevenue = completedOrdersList.reduce((sum, o) => sum + o.total, 0);

  // --- Sign Out ---
  const handleLogout = () => {
    sessionStorage.removeItem("vendorToken");
    sessionStorage.removeItem("vendorInfo");
    navigate("/vendor/login");
  };

  // --- WhatsApp Dialog Link ---
  const getWhatsAppLink = (phone, orderId, studentName) => {
    // Sanitize the phone string by removing all spaces, dashes, brackets, and + signs
    const sanitized = String(phone || "").replace(/[^0-9]/g, "");

    // Crucial Formatting Logic:
    // Check if the sanitized number starts with a 0 and is exactly 11 digits long (standard local Pakistani format).
    // If it is, replace the leading 0 with 92. If it already starts with 92, leave it as is.
    let formattedNumber = sanitized;
    if (sanitized.startsWith("0") && sanitized.length === 11) {
      formattedNumber = "92" + sanitized.slice(1);
    }

    const customer = studentName || "Customer";
    const restaurant = selectedRestaurant || vendorUser?.name || "Restaurant";
    const orderIdentifier = orderId || "";
    const message = `Hi ${customer}, this is ${restaurant}. Regarding your order ${orderIdentifier}, we are ready to proceed. Let's discuss details!`;

    // Modern universal link format with URL-encoded message
    return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[240px] shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between py-6 max-md:hidden">
        <div>
          {/* Logo Branding */}
          <div className="px-6 pb-6 border-b border-slate-50 mb-6 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-black text-[#0a2342] tracking-tight">
                Campus<span className="text-[#e2725b]">Connect</span> <span className="text-[#e2725b]">x</span> {selectedRestaurant || "Restaurant"}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Vendor Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 border-none cursor-pointer ${activeSection === "dashboard"
                ? "bg-[#fff1f2] text-[#e2725b]"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                }`}
            >
              <i className="fa-solid fa-gauge text-xs" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveSection("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 border-none cursor-pointer ${activeSection === "orders"
                ? "bg-[#fff1f2] text-[#e2725b]"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                }`}
            >
              <span className="flex items-center gap-3">
                <i className="fa-solid fa-bag-shopping text-xs" />
                <span>Orders</span>
              </span>
              {activeOrdersCount > 0 && (
                <span className="bg-[#e2725b] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection("menu")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 border-none cursor-pointer ${activeSection === "menu"
                ? "bg-[#fff1f2] text-[#e2725b]"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                }`}
            >
              <i className="fa-solid fa-utensils text-xs" />
              <span>Menu Management</span>
            </button>

            <button
              onClick={() => setActiveSection("riders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 border-none cursor-pointer ${activeSection === "riders"
                ? "bg-[#fff1f2] text-[#e2725b]"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                }`}
            >
              <i className="fa-solid fa-motorcycle text-xs" />
              <span>Delivery Riders</span>
            </button>

            <button
              onClick={() => setActiveSection("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 border-none cursor-pointer ${activeSection === "profile"
                ? "bg-[#fff1f2] text-[#e2725b]"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                }`}
            >
              <i className="fa-solid fa-user text-xs" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 border-none cursor-pointer ${activeSection === "settings"
                ? "bg-[#fff1f2] text-[#e2725b]"
                : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                }`}
            >
              <i className="fa-solid fa-gear text-xs" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="px-3 border-t border-slate-50 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold text-rose-500 hover:bg-rose-50/50 transition-all duration-200 border-none bg-transparent cursor-pointer"
          >
            <i className="fa-solid fa-right-from-bracket text-xs" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER NAVIGATION OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-50 md:hidden flex animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="w-[280px] bg-white h-full flex flex-col justify-between py-6 px-4 shadow-2xl animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="px-3 pb-6 border-b border-slate-50 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-black text-[#0a2342] tracking-tight">
                    Campus<span className="text-[#e2725b]">Connect</span> <span className="text-[#e2725b]">x</span> {selectedRestaurant || "Restaurant"}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-black text-slate-400 p-1 hover:text-slate-600 border-none bg-none cursor-pointer"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <nav className="space-y-1">
                {[
                  { id: "dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
                  { id: "orders", icon: "fa-solid fa-bag-shopping", label: "Orders", badge: activeOrdersCount },
                  { id: "menu", icon: "fa-solid fa-utensils", label: "Menu Management" },
                  { id: "riders", icon: "fa-solid fa-motorcycle", label: "Delivery Riders" },
                  { id: "profile", icon: "fa-solid fa-user", label: "Profile" },
                  { id: "settings", icon: "fa-solid fa-gear", label: "Settings" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border-none ${activeSection === item.id ? "bg-[#fff1f2] text-[#e2725b]" : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342] bg-transparent"
                      }`}
                  >
                    <span className="flex items-center gap-3">
                      <i className={`${item.icon} text-xs`} />
                      <span>{item.label}</span>
                    </span>
                    {item.badge > 0 && (
                      <span className="bg-[#e2725b] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-extrabold text-rose-500 hover:bg-rose-50/50 transition-all border-none bg-transparent cursor-pointer"
              >
                <i className="fa-solid fa-right-from-bracket text-xs" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">

        {/* Header bar */}
        <header className="sticky top-0 bg-slate-50/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-5 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white border border-slate-200/80 text-[#0a2342] text-sm shrink-0 shadow-sm hover:bg-slate-100 active:scale-95 cursor-pointer transition-all flex items-center justify-center"
              title="Toggle Menu"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"}`} />
            </button>
            <div>
              <p className="text-[10px] font-bold text-slate-400 leading-tight">Good afternoon, {vendorUser.name}</p>
              <h2 className="text-base sm:text-xl font-black text-[#0a2342] mt-0.5 capitalize leading-tight">
                {activeSection === "dashboard" ? "Dashboard" : activeSection.replace("-", " ")}
              </h2>
              <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-400 mt-0.5 hidden xs:block">
                Here's an overview of your restaurant today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-5">
            {/* Notifications */}
            <div
              onClick={() => {
                setNewNotifications(0);
                setActiveSection("orders");
              }}
              className="relative cursor-pointer p-2 bg-white rounded-full border border-slate-200/60 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <i className="fa-solid fa-bell text-[#0a2342] text-sm hover:scale-105 transition-transform flex items-center justify-center" />
              {newNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 w-2.5 h-2.5 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </div>

            {/* Restaurant Selector */}
            <div className="flex items-center gap-2 sm:gap-2.5 bg-white border border-slate-200/60 pl-2.5 sm:pl-3.5 pr-3 sm:pr-4 py-1.5 rounded-full shadow-sm">
              <img
                src={vendorUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                alt="Avatar"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-100"
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[10px] sm:text-[11px] font-black text-[#0a2342] max-w-[90px] sm:max-w-none truncate">{selectedRestaurant}</span>
                <span className="text-[8px] sm:text-[8.5px] font-black text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages Area */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 pb-24 md:pb-8">
          {activeSection === "dashboard" && (
            <div className="flex flex-col gap-8">

              {/* ── Row of 4 Metrics Cards ── */}
              <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {/* Orders Today */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-lg shadow-sm shrink-0">
                    <i className="fa-solid fa-bag-shopping" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Today's Orders</span>
                    <span className="text-2xl font-black text-[#0a2342] block mt-0.5">{todayOrders}</span>
                    <span className="text-[9px] font-bold text-emerald-600 block mt-0.5 flex items-center gap-1">
                      <i className="fa-solid fa-arrow-trend-up text-[9px]" />
                      <span>20% vs yesterday</span>
                    </span>
                  </div>
                </div>

                {/* Today's Revenue */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 text-lg shadow-sm shrink-0">
                    <i className="fa-solid fa-coins" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Today's Revenue</span>
                    <span className="text-xl font-black text-[#0a2342] block mt-1">Rs. {todayRevenue.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-orange-600 block mt-0.5 flex items-center gap-1">
                      <i className="fa-solid fa-arrow-trend-up text-[9px]" />
                      <span>18% vs yesterday</span>
                    </span>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-lg shadow-sm shrink-0">
                    <i className="fa-solid fa-receipt" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Total Orders</span>
                    <span className="text-2xl font-black text-[#0a2342] block mt-0.5">{orders.length}</span>
                    <span className="text-[9px] font-bold text-purple-600 block mt-0.5">All-time Orders</span>
                  </div>
                </div>

                {/* Avg Rating */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-yellow-50/70 rounded-2xl flex items-center justify-center text-yellow-600 text-lg shadow-sm shrink-0">
                    <i className="fa-solid fa-star" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Avg. Rating</span>
                    <span className="text-2xl font-black text-[#0a2342] block mt-0.5">5.0</span>
                    <span className="text-[9px] font-bold text-yellow-600 block mt-0.5">
                      <i className="fa-solid fa-star text-[9px] mr-1 text-amber-500" />
                      Top Rated Eatery
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Main content body: Left / Right splits ── */}
              <div className="flex gap-8 items-start max-xl:flex-col">

                {/* Left Column: Recent Orders & Menu management */}
                <div className="flex-grow flex flex-col gap-8 w-full xl:w-[65%]">

                  {/* Recent Orders Card */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-black">
                          <i className="fa-solid fa-bag-shopping" />
                        </div>
                        <div>
                          <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide">
                            Recent Orders
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-400">
                            Live student order incoming stream
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSection("orders")}
                        className="text-teal-600 text-[11px] font-black hover:text-teal-700 bg-teal-50 px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                      >
                        <span>View All Orders ({orders.length})</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </button>
                    </div>

                    {activeOrdersList.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        <div className="text-3xl mb-2 text-slate-300">
                          <i className="fa-solid fa-inbox" />
                        </div>
                        <p className="text-xs font-bold text-slate-500">No active recent orders</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Orders placed by students will appear here in real-time</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {activeOrdersList.slice(0, 5).map((order) => (
                          <div
                            key={order.id}
                            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col xl:flex-row xl:flex-wrap items-start xl:items-center justify-between gap-4"
                          >
                            {/* Order Customer & Info */}
                            <div className="flex items-start xl:items-center gap-3.5 min-w-[240px] flex-1">
                              <img
                                src={order.avatar}
                                alt={order.studentName}
                                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-[#0a2342] text-xs">{order.studentName}</span>
                                  <span className="text-[10px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                    {order.id}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.status === "New" || order.status === "pending" || order.status === "Pending"
                                      ? "bg-amber-100 text-amber-800"
                                      : order.status === "Preparing" || order.status === "accepted"
                                        ? "bg-orange-100 text-orange-800"
                                        : order.status === "dispatched" || order.status === "Dispatched"
                                          ? "bg-blue-100 text-blue-800"
                                          : order.status === "arrived"
                                            ? "bg-purple-100 text-purple-800"
                                            : order.status === "completed" || order.status === "Completed"
                                              ? "bg-emerald-100 text-emerald-800"
                                              : "bg-rose-100 text-rose-800"
                                      }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-400 mt-1 truncate">
                                  <i className="fa-solid fa-box text-slate-400 text-[10px] mr-1" />
                                  {order.items}
                                </p>
                                <div className="text-[10px] font-semibold text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                                  <span>
                                    <i className="fa-regular fa-clock text-[10px] mr-1" />
                                    {order.time}
                                  </span>
                                  <span>
                                    <i className="fa-solid fa-location-dot text-[#00c2cb] text-[10px] mr-1" />
                                    {order.location || "Campus Main Gate"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex items-center justify-between xl:justify-end flex-wrap gap-3 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100/80 w-full xl:w-auto mt-1 xl:mt-0">
                              <div className="text-right">
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</div>
                                <div className="text-sm font-black text-emerald-600">Rs. {order.total}</div>
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={getWhatsAppLink(order.phone, order.orderId || order.id, order.studentName)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Contact Customer on WhatsApp"
                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-xs font-bold flex items-center gap-1.5"
                                >
                                  <i className="fa-brands fa-whatsapp text-sm" />
                                  <span className="hidden sm:inline">WhatsApp</span>
                                </a>

                                {/* STAGE 1: New/Pending - Accept or Reject */}
                                {order.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.orderId || order.id, "accepted")}
                                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1 border-none"
                                    >
                                      <i className="fa-solid fa-check" />
                                      <span>Accept</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenCancelModal(order)}
                                      className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-100 flex items-center gap-1"
                                      title="Reject order"
                                    >
                                      <i className="fa-solid fa-xmark" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                {/* STAGE 2: Accepted - Mark Preparing + Cancel */}
                                {order.status === "accepted" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.orderId || order.id, "preparing")}
                                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1 cursor-pointer border-none"
                                    >
                                      <i className="fa-solid fa-fire-burner" />
                                      <span>Mark Preparing</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenCancelModal(order)}
                                      className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-100 flex items-center gap-1"
                                      title="Cancel order"
                                    >
                                      <i className="fa-solid fa-xmark" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                )}

                                {/* STAGE 3: Preparing - Mark Ready + Cancel */}
                                {order.status === "preparing" && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.orderId || order.id, "ready")}
                                      className="px-3 py-2 bg-[#0a2342] hover:bg-[#123e75] text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-none"
                                    >
                                      <i className="fa-solid fa-box-open" />
                                      <span>Ready for Pickup!</span>
                                    </button>
                                    <button
                                      onClick={() => handleOpenCancelModal(order)}
                                      className="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-100 flex items-center gap-1"
                                      title="Cancel order"
                                    >
                                      <i className="fa-solid fa-xmark" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                )}

                                {/* STAGE 4: Ready — waiting for rider pickup + Cancel */}
                                {order.status === "ready" && (
                                  <>
                                    <span className="px-2.5 py-1.5 bg-cyan-50 text-cyan-700 rounded-xl text-[10px] font-black uppercase tracking-wider animate-pulse border border-cyan-200 flex items-center gap-1">
                                      <i className="fa-solid fa-motorcycle" />
                                      <span>Awaiting Rider</span>
                                    </span>
                                    <button
                                      onClick={() => handleOpenCancelModal(order)}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-100 flex items-center gap-1"
                                      title="Cancel order"
                                    >
                                      <i className="fa-solid fa-xmark" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                )}

                                {/* STAGE 5: Rider picked up + Cancel */}
                                {order.status === "picked_up" && (
                                  <>
                                    <span className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-blue-200 flex items-center gap-1">
                                      <i className="fa-solid fa-motorcycle" />
                                      <span>En Route</span>
                                    </span>
                                    <button
                                      onClick={() => handleOpenCancelModal(order)}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-100 flex items-center gap-1"
                                      title="Cancel order"
                                    >
                                      <i className="fa-solid fa-xmark" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                )}

                                {/* STAGE 6: Arrived + Cancel */}
                                {order.status === "arrived" && (
                                  <>
                                    <span className="px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-wider animate-pulse border border-purple-200 flex items-center gap-1">
                                      <i className="fa-solid fa-location-dot" />
                                      <span>Rider Arrived</span>
                                    </span>
                                    <button
                                      onClick={() => handleOpenCancelModal(order)}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border border-rose-100 flex items-center gap-1"
                                      title="Cancel order"
                                    >
                                      <i className="fa-solid fa-xmark" />
                                      <span>Cancel</span>
                                    </button>
                                  </>
                                )}

                                {/* STAGE 7: Completed */}
                                {order.status === "completed" && (
                                  <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-200 flex items-center gap-1">
                                    <i className="fa-solid fa-circle-check" />
                                    <span>Delivered</span>
                                  </span>
                                )}

                                {/* Terminal: Cancelled */}
                                {order.status === "cancelled" && (
                                  <span className="px-2.5 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-rose-200 flex items-center gap-1">
                                    <i className="fa-solid fa-circle-xmark" />
                                    <span>Cancelled</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Menu Management table */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide">
                        Menu Management
                      </h3>
                      <button
                        onClick={handleAddNewItemClick}
                        className="bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                      >
                        <span>+</span> Add New Item
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="pb-3 font-black">Item</th>
                            <th className="pb-3 font-black">Category</th>
                            <th className="pb-3 font-black">Price</th>
                            <th className="pb-3 font-black text-center">Status</th>
                            <th className="pb-3 font-black text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-600">
                          {menu.slice(0, 5).map((item) => (
                            <tr key={item.id} className="border-b border-slate-50/50 hover:bg-slate-50/40">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-xl object-cover border"
                                  />
                                  <div>
                                    <span className="font-extrabold text-[#0a2342] block">{item.name}</span>
                                    <span className="text-[10px] font-medium text-slate-400 line-clamp-1 max-w-[200px]">
                                      {item.description}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 font-extrabold text-slate-400">{item.category}</td>
                              <td className="py-3 text-[#0a2342] font-black">Rs. {item.price}</td>
                              <td className="py-3">
                                <div className="flex justify-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${item.status === "Active"
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-400"
                                      }`}
                                  >
                                    {item.status}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3">
                                <div className="flex items-center justify-center gap-3">
                                  <button
                                    onClick={() => handleEditItemClick(item)}
                                    className="text-slate-400 hover:text-teal-600 transition-colors text-sm border-none bg-transparent cursor-pointer"
                                    title="Edit"
                                  >
                                    <i className="fa-solid fa-pen text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors text-sm border-none bg-transparent cursor-pointer"
                                    title="Delete"
                                  >
                                    <i className="fa-solid fa-trash-can text-xs" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4.5 pt-4.5 border-t border-slate-50 text-center">
                      <button
                        onClick={() => setActiveSection("menu")}
                        className="text-teal-600 text-[11px] font-black hover:text-teal-700 transition-colors flex items-center justify-center gap-1 mx-auto border-none bg-transparent cursor-pointer"
                      >
                        <span>View all menu items</span>
                        <i className="fa-solid fa-arrow-right text-[10px]" />
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Column: Widgets */}
                <div className="w-full xl:w-[35%] flex flex-col gap-8">

                  {/* Today's Summary Card */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                    <h3 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide mb-5">
                      Today's Summary
                    </h3>
                    <div className="space-y-4.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-sm shrink-0 flex items-center justify-center">
                            <i className="fa-solid fa-bag-shopping" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">Orders Received</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">{todayOrders}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-orange-50 text-orange-600 rounded-xl text-sm shrink-0 flex items-center justify-center">
                            <i className="fa-solid fa-coins" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">Revenue</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">Rs. {todayRevenue.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-yellow-50 text-yellow-600 rounded-xl text-sm shrink-0 flex items-center justify-center">
                            <i className="fa-solid fa-tag" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">Items Sold</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">
                          {orders.filter(o => o && o.status !== "cancelled").reduce((sum, o) => sum + (Array.isArray(o.items) ? o.items.reduce((s, i) => s + (Number(i?.quantity) || 1), 0) : 0), 0)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-teal-50 text-teal-600 rounded-xl text-sm shrink-0 flex items-center justify-center">
                            <i className="fa-solid fa-users" />
                          </span>
                          <span className="text-xs font-bold text-slate-500">Customers</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">
                          {Array.from(new Set(orders.map(o => (o.student?._id || o.student || "").toString()).filter(Boolean))).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Restaurant Status Card */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                    <h3 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide mb-3">
                      Restaurant Status
                    </h3>

                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4 border border-slate-100">
                      <span className={`w-3.5 h-3.5 rounded-full ${restaurantOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
                      <div>
                        <span className="text-xs font-black text-[#0a2342]">
                          {restaurantOpen ? "Open" : "Closed"}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-tight">
                          {restaurantOpen ? "Your restaurant is visible to all students." : "Your restaurant is hidden from students."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleToggleRestaurantOpen}
                      className="w-full py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 bg-white rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer"
                    >
                      Update Status
                    </button>
                  </div>

                  {/* Need Help? Card */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                    <h3 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide mb-2">
                      Need Help?
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mb-5 leading-relaxed">
                      If you face any issues, our support team is here to help.
                    </p>
                    <button
                      onClick={() => showToast("Connecting to CampusConnect Canteen Support...", "info")}
                      className="w-full py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 bg-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                    >
                      <i className="fa-solid fa-phone text-xs" />
                      <span>Contact Support</span>
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* --- Dedicated Orders Section --- */}
          {activeSection === "orders" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wider">
                    Order Management
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    View live active preparation queue and completed delivered orders for today.
                  </p>
                </div>

                {/* Sub-tab pills */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setOrderSubTab("active")}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border-none ${orderSubTab === "active"
                      ? "bg-white text-[#0a2342] shadow-sm"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                      }`}
                  >
                    <i className="fa-solid fa-bolt text-xs text-amber-500" />
                    <span>Active Queue</span>
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[9px]">
                      {activeOrdersCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setOrderSubTab("completed")}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border-none ${orderSubTab === "completed"
                      ? "bg-white text-[#0a2342] shadow-sm"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                      }`}
                  >
                    <i className="fa-solid fa-circle-check text-xs text-emerald-500" />
                    <span>Today Completed Orders</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px]">
                      {completedOrdersList.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setOrderSubTab("cancelled")}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border-none ${orderSubTab === "cancelled"
                      ? "bg-white text-[#0a2342] shadow-sm"
                      : "text-slate-500 hover:text-slate-800 bg-transparent"
                      }`}
                  >
                    <i className="fa-solid fa-circle-xmark text-xs text-rose-500" />
                    <span>Cancelled Orders</span>
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[9px]">
                      {cancelledOrdersList.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Displayed Orders List */}
              {(() => {
                const displayedOrders = orderSubTab === "active" ? activeOrdersList : orderSubTab === "completed" ? completedOrdersList : cancelledOrdersList;

                if (displayedOrders.length === 0) {
                  return (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                      <div className="text-4xl mb-2 text-slate-300">
                        {orderSubTab === "active" ? (
                          <i className="fa-solid fa-bolt text-amber-500" />
                        ) : orderSubTab === "completed" ? (
                          <i className="fa-solid fa-circle-check text-emerald-500" />
                        ) : (
                          <i className="fa-solid fa-circle-xmark text-rose-500" />
                        )}
                      </div>
                      <h4 className="text-xs font-black text-[#0a2342]">
                        {orderSubTab === "active" ? "No Active Orders In Queue" : orderSubTab === "completed" ? "No Completed Orders Yet Today" : "No Cancelled Orders"}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-sm mx-auto">
                        {orderSubTab === "active"
                          ? "New student orders will show up here for preparation and rider dispatch."
                          : orderSubTab === "completed"
                            ? "Orders marked delivered by riders will automatically move into this section."
                            : "Orders that were cancelled will appear here."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {displayedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-slate-100 rounded-3xl p-5 hover:border-slate-200 transition-all bg-white"
                      >
                        <div className="flex items-start justify-between flex-wrap gap-4">
                          <div className="flex items-start gap-4 min-w-[240px] flex-1">
                            <img
                              src={order.avatar}
                              alt={order.studentName}
                              className="w-11 h-11 rounded-full object-cover border shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[14px] font-black text-[#0a2342]">{order.studentName}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                                  {order.id}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${order.status === "New"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : order.status === "Preparing"
                                      ? "bg-orange-50 text-orange-500"
                                      : order.status === "Completed" || order.status === "completed"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-50 text-rose-500"
                                    }`}
                                >
                                  {order.status}
                                </span>
                              </div>

                              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                                <i className="fa-solid fa-location-dot text-[#00c2cb] text-[10px]" />
                                <span>Delivery Location: <span className="font-extrabold text-[#0a2342]">{order.location}</span></span>
                              </p>
                              <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                                Placed: {order.time} | Phone: {order.phone}
                              </p>

                              <div className="mt-4 bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 max-w-lg">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                                  Ordered Items
                                </h4>
                                <ul className="space-y-1.5">
                                  {order.itemsList && order.itemsList.map((itm, idx) => (
                                    <li key={idx} className="flex justify-between text-xs font-bold text-[#0a2342]">
                                      <span>
                                        {itm.name} <span className="text-slate-400 font-medium">x {itm.quantity}</span>
                                      </span>
                                      <span className="font-black">Rs. {itm.price * itm.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between text-xs font-black">
                                  <span className="text-slate-400 uppercase tracking-wider text-[10px]">Total Amount</span>
                                  <span className="text-orange-600">Rs. {order.total}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right actions */}
                          <div className="flex flex-col gap-2 w-full max-w-[240px]">
                            <a
                              href={getWhatsAppLink(order.phone, order.orderId || order.id, order.studentName)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-colors"
                            >
                              <i className="fa-brands fa-whatsapp text-sm" />
                              <span>Contact Customer</span>
                            </a>

                            {/* STAGE 1: New/Pending - Accept or Reject */}
                            {order.status === "pending" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId || order.id, "accepted")}
                                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer border-none flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-check" />
                                  <span>Accept Order</span>
                                </button>
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-100 flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-xmark" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}

                            {/* STAGE 2: Accepted - Mark Preparing + Cancel */}
                            {order.status === "accepted" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId || order.id, "preparing")}
                                  className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer border-none flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-fire-burner" />
                                  <span>Mark Preparing</span>
                                </button>
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-100 flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-xmark" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            )}

                            {/* STAGE 3: Preparing - Mark Ready + Cancel */}
                            {order.status === "preparing" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId || order.id, "ready")}
                                  className="flex-1 py-2.5 px-4 bg-[#0a2342] hover:bg-[#123e75] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer border-none flex items-center justify-center gap-1.5"
                                >
                                  <i className="fa-solid fa-box-open" />
                                  <span>Ready for Pickup!</span>
                                </button>
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-100 flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-xmark" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            )}

                            {/* STAGE 4: Ready — awaiting rider pickup + Cancel */}
                            {order.status === "ready" && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 px-3 py-2 rounded-xl text-center border border-cyan-200 animate-pulse flex items-center justify-center gap-1">
                                  <i className="fa-solid fa-motorcycle" />
                                  <span>Awaiting Rider Pickup</span>
                                </span>
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-100 flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-xmark" />
                                  <span>Cancel Order</span>
                                </button>
                              </div>
                            )}

                            {/* STAGE 5: Rider picked up + Cancel */}
                            {order.status === "picked_up" && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-3 py-2 rounded-xl text-center border border-blue-200 flex items-center justify-center gap-1">
                                  <i className="fa-solid fa-motorcycle" />
                                  <span>En Route to Student</span>
                                </span>
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-100 flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-xmark" />
                                  <span>Cancel Order</span>
                                </button>
                              </div>
                            )}

                            {/* STAGE 6: Rider arrived + Cancel */}
                            {order.status === "arrived" && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-3 py-2 rounded-xl text-center border border-purple-200 animate-pulse flex items-center justify-center gap-1">
                                  <i className="fa-solid fa-location-dot" />
                                  <span>Rider Arrived at Location</span>
                                </span>
                                <button
                                  onClick={() => handleOpenCancelModal(order)}
                                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer border border-rose-100 flex items-center justify-center gap-1"
                                >
                                  <i className="fa-solid fa-xmark" />
                                  <span>Cancel Order</span>
                                </button>
                              </div>
                            )}

                            {/* STAGE 7: Completed */}
                            {order.status === "completed" && (
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl text-center border border-emerald-200 flex items-center justify-center gap-1">
                                <i className="fa-solid fa-circle-check" />
                                <span>Order Completed &amp; Delivered</span>
                              </span>
                            )}

                            {/* Terminal: Cancelled */}
                            {order.status === "cancelled" && (
                              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-2 rounded-xl text-center border border-rose-200 flex items-center justify-center gap-1">
                                <i className="fa-solid fa-circle-xmark" />
                                <span>Order Cancelled</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* --- Dedicated Menu Section --- */}
          {activeSection === "menu" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide">
                    Restaurant Menu Items
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    Manage prices, availability, and description of your menu.
                  </p>
                </div>
                <button
                  onClick={handleAddNewItemClick}
                  className="group bg-[#00c2cb] hover:bg-[#00a8b5] text-white text-xs font-extrabold px-4 sm:px-5 py-2.5 rounded-[14px] transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(0,194,203,0.5)] hover:shadow-[0_12px_25px_-8px_rgba(0,194,203,0.6)] flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <div className="bg-white/20 rounded-md p-1 group-hover:bg-white/30 transition-colors">
                    <i className="fa-solid fa-plus text-xs flex items-center justify-center" />
                  </div>
                  Add New Item
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white border border-slate-100/60 rounded-[24px] p-3 sm:p-4 hover:border-[#00c2cb]/30 hover:shadow-[0_12px_40px_-15px_rgba(0,194,203,0.15)] transition-all duration-300 relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative rounded-2xl overflow-hidden h-44 bg-slate-50 mb-4 group-hover:shadow-inner transition-all">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071A35]/80 via-transparent to-[#071A35]/20 opacity-60 mix-blend-multiply"></div>
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#071A35] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          {item.category}
                        </span>
                        <span
                          className={`absolute top-3 right-3 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${item.status === "Active"
                            ? "bg-emerald-500/90 text-white backdrop-blur-md"
                            : "bg-slate-700/80 text-white backdrop-blur-md"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Active" ? "bg-white" : "bg-slate-300"}`}></span>
                          {item.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-start mb-2 px-1">
                        <h4 className="text-[15px] font-black text-[#071A35] leading-snug tracking-tight group-hover:text-[#00c2cb] transition-colors line-clamp-1">{item.name}</h4>
                        <span className="text-[14px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-100/50 shrink-0">Rs. {item.price}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4 px-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 px-1 border-t border-slate-100/80 mt-auto">
                      <button
                        onClick={() => handleEditItemClick(item)}
                        className="flex-1 py-2.5 bg-slate-50 hover:bg-[#00c2cb] border border-slate-100 hover:border-[#00c2cb] rounded-xl text-[11px] font-extrabold text-slate-600 hover:text-white flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs flex items-center justify-center" />
                        Edit Item
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2.5 bg-white border border-rose-100 hover:bg-rose-50 hover:border-rose-200 text-rose-500 rounded-xl transition-all shadow-sm group/btn"
                        title="Delete"
                      >
                        <i className="fa-solid fa-trash-can text-sm group-hover/btn:scale-110 transition-transform flex items-center justify-center" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Dedicated Delivery Riders Section --- */}
          {activeSection === "riders" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide flex items-center gap-2">
                    <i className="fa-solid fa-motorcycle text-teal-600" />
                    <span>Delivery Riders Portal &amp; Access</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">
                    Manage delivery riders affiliated with {selectedRestaurant}. Create, edit, or remove riders for your fleet.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleOpenAddRiderModal}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border-none"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                    <span>Add New Rider</span>
                  </button>
                </div>
              </div>

              {/* Rider Cards Grid */}
              {registeredRiders.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-3xl text-center">
                  <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-3xl mb-3 mx-auto">
                    <i className="fa-solid fa-motorcycle" />
                  </div>
                  <h4 className="text-xs font-black text-[#0a2342]">No Registered Riders Yet</h4>
                  <p className="text-[11px] font-bold text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                    Click "Add New Rider" above to onboard delivery riders for {selectedRestaurant}.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddRiderModal}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all shadow-md border-none cursor-pointer flex items-center gap-1.5 mx-auto"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                    <span>Add Rider Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {registeredRiders.map((rider, idx) => (
                    <div key={rider.id || idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-black text-sm flex items-center justify-center border border-teal-200/60">
                            {rider.name ? rider.name.charAt(0).toUpperCase() : "R"}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-[#0a2342]">{rider.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{rider.phone || "+92 300 0000000"}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{rider.email}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${rider.status === "Online" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}>
                          {rider.status || "Online"}
                        </span>
                      </div>

                      <div className="text-[10px] font-bold text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span>Vehicle: {rider.vehicle || "Motorcycle"}</span>
                        <span className="text-amber-500 font-black flex items-center gap-1">
                          <i className="fa-solid fa-star text-xs" />
                          <span>5.0</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRiderModal(rider)}
                          className="flex-1 py-2 bg-white hover:bg-slate-100 text-[#0a2342] rounded-xl text-[10.5px] font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                        >
                          <i className="fa-solid fa-pen text-xs" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRider(rider.id || idx)}
                          className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10.5px] font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-100"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- Dedicated Profile Section --- */}
          {activeSection === "profile" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm max-w-2xl">
              <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide mb-6">
                Vendor Profile Settings
              </h3>
              <form
                onSubmit={handleSaveVendorProfile}
                className="space-y-5"
              >
                <div className="flex items-center gap-5 pb-5 border-b border-slate-50">
                  <img
                    src={vendorUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendorUser.name || "Vendor")}&background=0A2342&color=fff`}
                    alt="Vendor Avatar"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-[#0a2342]">{vendorUser.name || "Vendor Partner"}</h4>
                    <p className="text-[11px] font-semibold text-slate-400">Owner of {selectedRestaurant || "Restaurant"}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="file"
                        id="vendor-avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("vendor-avatar-upload").click()}
                        className="text-xs font-bold text-teal-600 hover:underline border-none bg-none cursor-pointer flex items-center gap-1"
                      >
                        <i className="fa-solid fa-arrow-up-from-bracket text-xs" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                    Restaurant Logo / Cover Image URL
                  </label>
                  <input
                    type="text"
                    value={vendorUser.avatar || ""}
                    onChange={(e) => setVendorUser({ ...vendorUser, avatar: e.target.value })}
                    placeholder="https://... or upload photo above"
                    className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={vendorUser.name || ""}
                      onChange={(e) => setVendorUser({ ...vendorUser, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={vendorUser.email || ""}
                      onChange={(e) => setVendorUser({ ...vendorUser, email: e.target.value })}
                      placeholder="vendor@campusconnect.com"
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={selectedRestaurant || ""}
                      onChange={(e) => setSelectedRestaurant(e.target.value)}
                      placeholder="Restaurant Name"
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      WhatsApp Contact Number
                    </label>
                    <input
                      type="text"
                      value={vendorUser.phone || ""}
                      onChange={(e) => setVendorUser({ ...vendorUser, phone: e.target.value })}
                      placeholder="WhatsApp Contact Number"
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                    Restaurant Address
                  </label>
                  <textarea
                    rows="3"
                    value={restaurantAddress || ""}
                    onChange={(e) => setRestaurantAddress(e.target.value)}
                    placeholder="Restaurant Address"
                    className="w-full px-5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0a2342] hover:bg-[#e2725b] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors border-none cursor-pointer"
                >
                  Save Profile Info
                </button>
              </form>
            </div>
          )}

          {/* --- Dedicated Settings Section --- */}
          {activeSection === "settings" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm max-w-2xl">
              <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide mb-6">
                System &amp; Portal Settings
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div>
                    <h4 className="text-xs font-black text-[#0a2342]">Email Notifications</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Receive summary reports of daily orders via email.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded" />
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div>
                    <h4 className="text-xs font-black text-[#0a2342]">New Order Alert Sound</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Play a notification sound when a new student order comes in.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-teal-600 rounded" />
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                  <div>
                    <h4 className="text-xs font-black text-[#0a2342]">Automatic Order Cancellation</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Automatically reject pending orders if not accepted within 15 minutes.</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="py-5 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 mt-auto bg-white">
          © 2026 CampusConnect. Mr. Sagheer Ahmad &amp; Mr. Shujaat Ali Hashim. All rights reserved.
        </footer>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {[
          { id: "dashboard", icon: "fa-solid fa-gauge", label: "Dashboard" },
          { id: "orders", icon: "fa-solid fa-bag-shopping", label: "Orders", badge: activeOrdersCount },
          { id: "menu", icon: "fa-solid fa-utensils", label: "Menu" },
          { id: "riders", icon: "fa-solid fa-motorcycle", label: "Riders" },
          { id: "profile", icon: "fa-solid fa-user", label: "Profile" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all border-none bg-none cursor-pointer ${activeSection === tab.id ? "text-[#e2725b] font-black" : "text-slate-400 font-bold"
              }`}
          >
            <i className={`${tab.icon} text-base`} />
            <span className="text-[9.5px] mt-1">{tab.label}</span>
            {tab.badge > 0 && (
              <span className="absolute -top-1 right-1 bg-[#e2725b] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ADD/EDIT MENU ITEM MODAL ── */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#0a2342]">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h3>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 hover:bg-slate-200 border-none cursor-pointer"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Zinger Burger"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    list="database-categories-list"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="Type or select category..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                  />
                  <datalist id="database-categories-list">
                    {Array.from(
                      new Set(
                        (menu || [])
                          .map((i) => i.category)
                          .filter(Boolean)
                          .concat(["Burgers", "Pasta", "Pizza", "Beverages", "Desserts", "Traditional", "Sides", "Deals"])
                      )
                    ).map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Price (Rs.)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="e.g. 180"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Status
                </label>
                <AnimatedSelect
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  options={[
                    { value: "Active", label: "Active / Available", iconClass: "fa-solid fa-circle-check" },
                    { value: "Inactive", label: "Inactive / Out of stock", iconClass: "fa-solid fa-circle-xmark" }
                  ]}
                  buttonClassName="bg-slate-50 border-slate-200 text-xs font-bold text-[#0a2342] py-2.5 px-3.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Menu Item Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItemImageFile(e.target.files[0])}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                />
                <div className="text-[10px] text-slate-400 mt-1 font-bold">
                  Or paste an image URL instead:
                </div>
                <input
                  type="text"
                  value={itemImage}
                  onChange={(e) => {
                    setItemImage(e.target.value);
                    if (e.target.value) setItemImageFile(null);
                  }}
                  placeholder="Paste an Unsplash image URL or leave empty"
                  className="w-full mt-1.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Provide a delicious description..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-[#0a2342] border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm border-none cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD/EDIT RIDER MODAL ── */}
      {isRiderModalOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-[#0a2342]">
                {editingRider ? "Edit Delivery Rider" : "Add New Delivery Rider"}
              </h3>
              <button
                onClick={() => setIsRiderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 hover:bg-slate-200 cursor-pointer border-none"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSaveRiderSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Rider Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={riderFormName}
                  onChange={(e) => setRiderFormName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={riderFormEmail}
                    onChange={(e) => setRiderFormEmail(e.target.value)}
                    placeholder="rider@campusconnect.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={riderFormPhone}
                    onChange={(e) => setRiderFormPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Vehicle Type
                  </label>
                  <AnimatedSelect
                    value={riderFormVehicle}
                    onChange={(e) => setRiderFormVehicle(e.target.value)}
                    options={[
                      { value: "Motorcycle", label: "Motorcycle", iconClass: "fa-solid fa-motorcycle" },
                      { value: "Electric Scooter", label: "Electric Scooter", iconClass: "fa-solid fa-bolt" },
                      { value: "Bicycle", label: "Bicycle", iconClass: "fa-solid fa-bicycle" },
                      { value: "Scooter", label: "Scooter", iconClass: "fa-solid fa-motorcycle" }
                    ]}
                    buttonClassName="bg-slate-50 border-slate-200 text-xs font-bold text-[#0a2342] py-2.5 px-3.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Rider Status
                  </label>
                  <AnimatedSelect
                    value={riderFormStatus}
                    onChange={(e) => setRiderFormStatus(e.target.value)}
                    options={[
                      { value: "Online", label: "Online / Active", iconClass: "fa-solid fa-circle-check" },
                      { value: "Offline", label: "Offline", iconClass: "fa-solid fa-circle-minus" },
                      { value: "Busy", label: "Busy (Delivering)", iconClass: "fa-solid fa-person-running" }
                    ]}
                    buttonClassName="bg-slate-50 border-slate-200 text-xs font-bold text-[#0a2342] py-2.5 px-3.5 rounded-xl"
                  />
                </div>
              </div>

              {!editingRider && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={riderFormRegNo}
                    onChange={(e) => setRiderFormRegNo(e.target.value)}
                    placeholder="2026F-mulrider-101"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  {editingRider ? "Password (leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingRider}
                  value={riderFormPassword}
                  onChange={(e) => setRiderFormPassword(e.target.value)}
                  placeholder={editingRider ? "••••••••" : "Password for rider login"}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRiderModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-[#0a2342] cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm cursor-pointer border-none"
                >
                  {editingRider ? "Update Rider" : "Create Rider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDER CANCELLATION CONFIRMATION MODAL ── */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-[#071A35]/70 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-rose-100 rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-y-auto max-h-[85vh] scrollbar-none animate-modal-slide-in">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-lg shadow-xs">
                  <i className="fa-solid fa-ban text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0a2342] tracking-tight">Cancel Food Order</h3>
                  <p className="text-[11px] font-bold text-slate-400">Order ID: {cancelModalOrder.orderId || cancelModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={handleCloseCancelModal}
                disabled={isCancellingOrder}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xs font-black transition-all flex items-center justify-center cursor-pointer border-none"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Order Info Card */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>Customer:</span>
                <span className="font-extrabold text-[#0a2342]">{cancelModalOrder.studentName || "Student"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>Current Pipeline Stage:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                  {(cancelModalOrder.status || "active").replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-semibold">
                <span>Total Amount:</span>
                <span className="font-black text-rose-600 text-sm">Rs. {cancelModalOrder.total}</span>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 mb-5 flex items-start gap-3 text-rose-700">
              <i className="fa-solid fa-triangle-exclamation text-base mt-0.5 shrink-0 text-rose-600" />
              <p className="text-[11px] font-bold leading-relaxed m-0">
                Cancelling will <strong>immediately close this delivery pipeline</strong>. Automated cancel notifications will be sent to the student and any assigned rider.
              </p>
            </div>

            {/* Reason Selection */}
            <div className="mb-5 space-y-3">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Select Cancellation Reason:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Out of Stock / Ingredients",
                  "Kitchen Overloaded / High Delay",
                  "Restaurant Closing Early",
                  "Customer Requested Cancellation",
                  "Other / Custom Reason"
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${cancelReasonPreset === reason
                      ? "bg-rose-50/70 border-rose-300 text-rose-800 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="cancelPreset"
                      value={reason}
                      checked={cancelReasonPreset === reason}
                      onChange={(e) => setCancelReasonPreset(e.target.value)}
                      className="accent-rose-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReasonPreset === "Other / Custom Reason" && (
                <div className="mt-2 animate-fade-in">
                  <textarea
                    rows={2}
                    value={cancelReasonCustom}
                    onChange={(e) => setCancelReasonCustom(e.target.value)}
                    placeholder="Type custom cancellation reason here..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-rose-400 focus:bg-white resize-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={isCancellingOrder}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-none disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                disabled={isCancellingOrder}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCancellingOrder ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-ban text-sm" />
                    <span>Cancel Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="text-[16px] mt-0.5">
            {toast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation text-amber-500" />}
            {toast.type === 'error' && <i className="fa-solid fa-circle-xmark text-rose-500" />}
            {toast.type === 'success' && <i className="fa-solid fa-circle-check text-emerald-500" />}
            {toast.type === 'info' && <i className="fa-solid fa-circle-info text-[#00c2cb]" />}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-[13px] font-black text-[#0a2342]">
              {toast.type === 'warning' ? 'AI Moderation Alert'
                : toast.type === 'error' ? 'Error'
                  : toast.type === 'success' ? 'Success' : 'Notice'}
            </strong>
            <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button className="text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1 p-1 text-xs" onClick={() => setToast(null)}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}
    </div>
  );
}
