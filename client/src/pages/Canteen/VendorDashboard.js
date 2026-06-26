import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard"); // dashboard, orders, menu, profile, settings
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState("Canteen");
  const [vendorUser, setVendorUser] = useState({ name: "Vendor", email: "" });
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [newNotifications, setNewNotifications] = useState(0);

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
          id: order._id,
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
          status: order.status === "Pending" ? "New" : order.status,
          location: order.location || "Main Campus",
          createdAt: new Date(order.createdAt)
        }));
        mappedOrders.sort((a, b) => b.createdAt - a.createdAt);
        setOrders(mappedOrders);
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

    // Initialize Socket.io connection
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      if (info._id) {
        socket.emit("join_user_room", info._id);
        console.log(`Vendor joined private room: ${info._id}`);
      }
    });

    socket.on("new_vendor_order", (newOrder) => {
      const mapped = {
        id: newOrder._id,
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
        status: newOrder.status === "Pending" ? "New" : newOrder.status,
        location: newOrder.location || "Main Campus",
        createdAt: new Date(newOrder.createdAt)
      };

      setOrders(prev => [mapped, ...prev]);
      setNewNotifications(prev => prev + 1);
      playNotificationSound();
      showToast(`New order received from ${newOrder.student?.name || "Student"}! 🍔`, "success");
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, showToast]);

  // --- Menu Management Modal States ---
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
          setRestaurantOpen(false); // Closed for now since menu is updating
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
          setRestaurantOpen(false); // Closed for now since menu is updating
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

  // --- Order Status Modifications ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = sessionStorage.getItem("vendorToken");
    try {
      const backendStatus = newStatus === "New" ? "Pending" : newStatus;
      const { data } = await axios.put(`/api/vendor/orders/${orderId}/status`, { status: backendStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setOrders(prev =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status updated to: ${newStatus}`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update order status", "error");
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
        showToast(`Restaurant is now ${data.isActive ? "Open" : "Closed"}! 🏪`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to toggle restaurant status", "error");
    }
  };

  // --- Statistics Calculation ---
  const activeOrdersCount = orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;
  const todayOrders = orders.filter((o) => o.status !== "Cancelled").length;
  const todayRevenue = orders
    .filter((o) => o.status === "Completed" || o.status === "Preparing" || o.status === "New")
    .reduce((sum, o) => sum + o.total, 0);

  // --- Sign Out ---
  const handleLogout = () => {
    sessionStorage.removeItem("vendorToken");
    sessionStorage.removeItem("vendorInfo");
    navigate("/vendor/login");
  };

  // --- WhatsApp Dialog Link ---
  const getWhatsAppLink = (phone, orderId, studentName) => {
    const text = `Hi ${studentName}, this is ${selectedRestaurant}. Regarding your order ${orderId}, we are ready to proceed. Let's discuss details!`;
    return `https://wa.me/${phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[240px] shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between py-6 max-md:hidden">
        <div>
          {/* Logo Branding */}
          <div className="px-6 pb-6 border-b border-slate-50 mb-6 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍳</span>
              <span className="text-[15px] font-black text-[#0a2342] tracking-tight">
                Campus<span className="text-[#e2725b]">Connect</span>
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest pl-7">
              Vendor Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveSection("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 ${
                activeSection === "dashboard"
                  ? "bg-[#fff1f2] text-[#e2725b]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342]"
              }`}
            >
              <span>🏠</span> Dashboard
            </button>

            <button
              onClick={() => setActiveSection("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 ${
                activeSection === "orders"
                  ? "bg-[#fff1f2] text-[#e2725b]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342]"
              }`}
            >
              <span className="flex items-center gap-3">
                <span>🛍️</span> Orders
              </span>
              {activeOrdersCount > 0 && (
                <span className="bg-[#e2725b] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSection("menu")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 ${
                activeSection === "menu"
                  ? "bg-[#fff1f2] text-[#e2725b]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342]"
              }`}
            >
              <span>🍴</span> Menu Management
            </button>

            <button
              onClick={() => setActiveSection("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 ${
                activeSection === "profile"
                  ? "bg-[#fff1f2] text-[#e2725b]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342]"
              }`}
            >
              <span>👤</span> Profile
            </button>

            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold transition-all duration-200 ${
                activeSection === "settings"
                  ? "bg-[#fff1f2] text-[#e2725b]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0a2342]"
              }`}
            >
              <span>⚙️</span> Settings
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="px-3 border-t border-slate-50 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[12.5px] font-extrabold text-rose-500 hover:bg-rose-50/50 transition-all duration-200"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
        
        {/* Header bar */}
        <header className="sticky top-0 bg-slate-50/80 backdrop-blur-md px-8 py-5 border-b border-slate-100 flex items-center justify-between z-10">
          <div>
            <p className="text-[10px] font-bold text-slate-400">Good afternoon, {vendorUser.name} 👋</p>
            <h2 className="text-xl font-black text-[#0a2342] mt-0.5 capitalize">
              {activeSection === "dashboard" ? "Dashboard" : activeSection.replace("-", " ")}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
              Here's an overview of your restaurant today.
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            <div 
              onClick={() => {
                setNewNotifications(0);
                setActiveSection("orders");
              }}
              className="relative cursor-pointer p-2 bg-white rounded-full border border-slate-200/60 shadow-sm"
            >
              <span className="text-lg">🔔</span>
              {newNotifications > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
              )}
            </div>

            {/* Restaurant Selector */}
            <div className="flex items-center gap-2.5 bg-white border border-slate-200/60 pl-3.5 pr-4 py-1.5 rounded-full shadow-sm">
              <img
                src={vendorUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-slate-100"
              />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-[11px] font-black text-[#0a2342]">{selectedRestaurant}</span>
                <span className="text-[8.5px] font-black text-emerald-600">Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Pages Area */}
        <div className="p-8 flex-1">
          {activeSection === "dashboard" && (
            <div className="flex flex-col gap-8">
              
              {/* ── Row of 4 Metrics Cards ── */}
              <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {/* Orders Today */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-xl shadow-sm shrink-0">
                    🛍️
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Today's Orders</span>
                    <span className="text-2xl font-black text-[#0a2342] block mt-0.5">{todayOrders}</span>
                    <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">↑ 20% vs yesterday</span>
                  </div>
                </div>

                {/* Today's Revenue */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 text-xl shadow-sm shrink-0">
                    🪙
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Today's Revenue</span>
                    <span className="text-xl font-black text-[#0a2342] block mt-1">Rs. {todayRevenue.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-orange-600 block mt-0.5">↑ 18% vs yesterday</span>
                  </div>
                </div>

                {/* Total Orders Monthly */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-xl shadow-sm shrink-0">
                    📝
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Total Orders</span>
                    <span className="text-2xl font-black text-[#0a2342] block mt-0.5">156</span>
                    <span className="text-[9px] font-bold text-purple-600 block mt-0.5">This Month</span>
                  </div>
                </div>

                {/* Avg Rating */}
                <div className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center gap-4.5 shadow-sm">
                  <div className="w-12 h-12 bg-yellow-50/70 rounded-2xl flex items-center justify-center text-yellow-600 text-xl shadow-sm shrink-0">
                    ⭐
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Avg. Rating</span>
                    <span className="text-2xl font-black text-[#0a2342] block mt-0.5">4.6</span>
                    <span className="text-[9px] font-bold text-yellow-600 block mt-0.5">★ From 98 reviews</span>
                  </div>
                </div>
              </div>

              {/* ── Main content body: Left / Right splits ── */}
              <div className="flex gap-8 items-start max-xl:flex-col">
                
                {/* Left Column: Recent Orders & Menu management */}
                <div className="flex-grow flex flex-col gap-8 w-full xl:w-[65%]">
                  
                  {/* Recent Orders table */}
                  <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-[13px] font-black text-[#0a2342] uppercase tracking-wide">
                        Recent Orders
                      </h3>
                      <button
                        onClick={() => setActiveSection("orders")}
                        className="text-teal-600 text-[11px] font-black hover:text-teal-700 transition-colors"
                      >
                        View all orders
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="pb-3 font-black">Order ID</th>
                            <th className="pb-3 font-black">Customer</th>
                            <th className="pb-3 font-black">Items</th>
                            <th className="pb-3 font-black">Total</th>
                            <th className="pb-3 font-black">Time</th>
                            <th className="pb-3 font-black text-center">Status</th>
                            <th className="pb-3 font-black text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-600">
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b border-slate-50/50 hover:bg-slate-50/40">
                              <td className="py-4 text-[#0a2342] font-black text-[11.5px]">{order.id}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={order.avatar}
                                    alt={order.studentName}
                                    className="w-7 h-7 rounded-full object-cover border"
                                  />
                                  <span className="font-extrabold text-[#0a2342]">{order.studentName}</span>
                                </div>
                              </td>
                              <td className="py-4 max-w-[150px] truncate text-[11px] font-medium text-slate-400">
                                {order.items}
                              </td>
                              <td className="py-4 text-[#0a2342] font-black">Rs. {order.total}</td>
                              <td className="py-4 text-[10.5px] text-slate-400 font-semibold">{order.time}</td>
                              <td className="py-4">
                                <div className="flex justify-center">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      order.status === "New"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : order.status === "Preparing"
                                        ? "bg-orange-50 text-orange-500"
                                        : order.status === "Completed"
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-rose-50 text-rose-500"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Contact WhatsApp */}
                                  <a
                                    href={getWhatsAppLink(order.phone, order.id, order.studentName)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Contact via WhatsApp"
                                    className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100/70 transition-colors"
                                  >
                                    💬
                                  </a>
                                  {order.status === "New" && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                      className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                                    >
                                      Prep
                                    </button>
                                  )}
                                  {order.status === "Preparing" && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(order.id, "Completed")}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors"
                                    >
                                      Done
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                      item.status === "Active"
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
                                    className="text-slate-400 hover:text-teal-600 transition-colors text-sm"
                                    title="Edit"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors text-sm"
                                    title="Delete"
                                  >
                                    🗑️
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
                        className="text-teal-600 text-[11px] font-black hover:text-teal-700 transition-colors"
                      >
                        View all menu items →
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
                          <span className="p-2 bg-purple-50 text-purple-600 rounded-xl text-sm shrink-0">🛍️</span>
                          <span className="text-xs font-bold text-slate-500">Orders Received</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">{todayOrders}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-orange-50 text-orange-600 rounded-xl text-sm shrink-0">🪙</span>
                          <span className="text-xs font-bold text-slate-500">Revenue</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">Rs. {todayRevenue.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-yellow-50 text-yellow-600 rounded-xl text-sm shrink-0">🏷️</span>
                          <span className="text-xs font-bold text-slate-500">Items Sold</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">45</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-teal-50 text-teal-600 rounded-xl text-sm shrink-0">👥</span>
                          <span className="text-xs font-bold text-slate-500">New Customers</span>
                        </div>
                        <span className="text-sm font-black text-[#0a2342]">8</span>
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
                      className="w-full py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 bg-white rounded-xl text-xs font-extrabold transition-all duration-300"
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
                      className="w-full py-3 border border-teal-600 text-teal-600 hover:bg-teal-50 bg-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <span>📞</span> Contact Support
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* --- Dedicated Orders Section --- */}
          {activeSection === "orders" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wider">
                  Active Orders Queue
                </h3>
                <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[10px] font-black">
                  {activeOrdersCount} Pending Preparation
                </span>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-slate-100 rounded-3xl p-5 hover:border-slate-200 transition-all bg-white"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-start gap-4">
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
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                order.status === "New"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : order.status === "Preparing"
                                  ? "bg-orange-50 text-orange-500"
                                  : order.status === "Completed"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-rose-50 text-rose-500"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          
                          <p className="text-xs font-semibold text-slate-500 mt-1">
                            📍 Delivery Location: <span className="font-extrabold text-[#0a2342]">{order.location}</span>
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            Placed: {order.time} | Phone: {order.phone}
                          </p>

                          <div className="mt-4 bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 max-w-lg">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                              Ordered Items
                            </h4>
                            <ul className="space-y-1.5">
                              {order.itemsList.map((itm, idx) => (
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
                      <div className="flex flex-col gap-2 shrink-0">
                        <a
                          href={getWhatsAppLink(order.phone, order.id, order.studentName)}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-colors"
                        >
                          💬 Contact Customer
                        </a>

                        <div className="flex gap-2">
                          {order.status === "New" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                              className="flex-grow py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                            >
                              Accept & Prepare
                            </button>
                          )}
                          {order.status === "Preparing" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "Completed")}
                              className="flex-grow py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                            >
                              Mark Delivered
                            </button>
                          )}
                          {order.status !== "Completed" && order.status !== "Cancelled" && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                              className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-black px-4.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>+</span> Add New Item
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {menu.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-100 rounded-[24px] p-4.5 hover:border-slate-200 transition-all bg-white relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative rounded-2xl overflow-hidden h-40 bg-slate-100 mb-4 border">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0a2342] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                          {item.category}
                        </span>
                        <span
                          className={`absolute top-3 right-3 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow ${
                            item.status === "Active"
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-400 text-white"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="text-[14px] font-black text-[#0a2342]">{item.name}</h4>
                        <span className="text-sm font-black text-orange-600 shrink-0">Rs. {item.price}</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-bold leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 border-t border-slate-50 pt-3">
                      <button
                        onClick={() => handleEditItemClick(item)}
                        className="flex-1 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-[10.5px] font-black text-[#0a2342] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        ✏️ Edit Item
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="py-2.5 px-3.5 border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl text-xs transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- Dedicated Profile Section --- */}
          {activeSection === "profile" && (
            <div className="bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm max-w-2xl">
              <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide mb-6">
                Vendor Profile Settings
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  showToast("Profile updated successfully!", "success");
                }}
                className="space-y-5"
              >
                <div className="flex items-center gap-5 pb-5 border-b border-slate-50">
                  <img
                    src={vendorUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"}
                    alt="Vendor Avatar"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                  <div>
                    <h4 className="text-sm font-black text-[#0a2342]">{vendorUser.name}</h4>
                    <p className="text-[11px] font-semibold text-slate-400">Owner of {selectedRestaurant}</p>
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
                      className="mt-2 text-xs font-bold text-teal-600 hover:underline"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={vendorUser.name}
                      onChange={(e) => setVendorUser({ ...vendorUser, name: e.target.value })}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={vendorUser.email}
                      onChange={(e) => setVendorUser({ ...vendorUser, email: e.target.value })}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                      Restaurant Name
                    </label>
                    <input
                      type="text"
                      value={selectedRestaurant}
                      onChange={(e) => setSelectedRestaurant(e.target.value)}
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
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
                      className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                    Canteen Address
                  </label>
                  <textarea
                    rows="3"
                    defaultValue="Central Canteen, Block B, Minhaj University Campus Lahore"
                    className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-[#e2725b]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#0a2342] hover:bg-[#e2725b] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-colors"
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
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black"
              >
                ×
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
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                  >
                    <option value="Burgers">Burgers</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </select>
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
                <select
                  value={itemStatus}
                  onChange={(e) => setItemStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0a2342] focus:outline-none focus:border-teal-500"
                >
                  <option value="Active">Active / Available</option>
                  <option value="Inactive">Inactive / Out of stock</option>
                </select>
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
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-wider text-[#0a2342]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className={`fixed top-24 right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-[3000] flex gap-3 w-[360px] animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="text-[18px] mt-0.5">
            {toast.type === 'warning' && <span>⚠️</span>}
            {toast.type === 'error' && <span>❌</span>}
            {toast.type === 'success' && <span>✅</span>}
            {toast.type === 'info' && <span>ℹ️</span>}
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <strong className="text-[13px] font-black text-[#0a2342]">
              {toast.type === 'warning' ? 'AI Moderation Alert'
                : toast.type === 'error' ? 'Error'
                  : toast.type === 'success' ? 'Success' : 'Notice'}
            </strong>
            <p className="text-[12px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button className="text-[18px] text-slate-400 cursor-pointer border-none bg-none hover:text-slate-600 leading-none h-fit -mt-1" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}
