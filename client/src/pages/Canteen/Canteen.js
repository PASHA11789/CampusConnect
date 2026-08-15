import React, { useState, useEffect } from "react";
// Updated Canteen UI
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";
import { startArrivalAlertLoop, stopArrivalAlertLoop } from "../../utils/audioAlert";
import { showOrderStatusNotification } from "../../utils/browserNotification";


// Layout
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Canteen Subcomponents
import CanteenHero from "./components/CanteenHero";
import RestaurantList from "./components/RestaurantList";
import MenuBoard from "./components/MenuBoard";
import CheckoutCart from "./components/CheckoutCart";
import OrderTracker from "./components/OrderTracker";
import AddonModal from "./components/AddonModal";
// Assets

// ─── DATA ────────────────────────────────────────────────────────────────────

const POPULAR_DISHES = [
  { id: "mc1", name: "Big Mac Burger", price: 950, rating: 4.9, reviews: 320, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80", category: "Fast Food", desc: "Classic double beef patty burger with special sauce, lettuce & cheese.", restaurantId: "mcdonalds" },
  { id: "mc2", name: "McChicken Burger", price: 650, rating: 4.8, reviews: 210, image: "https://images.unsplash.com/photo-1615297928064-24977384d0da?w=500&q=80", category: "Fast Food", desc: "Crispy chicken patty with mayonnaise and lettuce.", restaurantId: "mcdonalds" },
  { id: "mc3", name: "Crispy French Fries", price: 350, rating: 4.9, reviews: 450, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80", category: "Fast Food", desc: "Golden salted crispy French fries.", restaurantId: "mcdonalds" }
];

const DEALS = [
  { id: "d1", tag: "SPECIAL DEAL", title: "Big Mac + Fries Combo", desc: "Get Big Mac with Crispy Fries & Drink", price: 1150, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", category: "Fast Food", name: "Big Mac Meal Deal", restaurantId: "mcdonalds" }
];

const CAMPUS_LOCATIONS = [
  "CS Department (Ground Floor)",
  "Central Library (Study Area)",
  "Admin Block (Main Reception)",
  "Hostel Block A (Room 105)",
  "Hostel Block B (Room 214)",
  "Main Playground Cafe",
];

const CATEGORIES = [
  { name: "All", iconClass: "fa-solid fa-utensils", bgColor: "bg-[#00c2cb]/10", textColor: "text-[#0079c2]" },
  { name: "Fast Food", iconClass: "fa-solid fa-burger", bgColor: "bg-orange-50", textColor: "text-orange-500" },
  { name: "Beverages", iconClass: "fa-solid fa-mug-hot", bgColor: "bg-blue-50", textColor: "text-blue-500" },
  { name: "Desserts", iconClass: "fa-solid fa-ice-cream", bgColor: "bg-pink-50", textColor: "text-pink-500" },
];

const DEFAULT_CANTEENS = [];


// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Canteen() {
  const navigate = useNavigate();

  // ── User / Session ──────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // ── UI / Navigation ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("browse");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Restaurant & Menu States (Dynamic) ─────────────────────────
  const location = useLocation();
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(location.state?.restaurantId || "");
  const [selectedVisualIndex, setSelectedVisualIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const hasAutoSelectedRef = React.useRef(false);

  // ── Delivery ────────────────────────────────────────────────────
  const [orderType, setOrderType] = useState("delivery");
  const [deliveryLocation, setDeliveryLocation] = useState("CS Department (Ground Floor)");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // ── Cart ────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [studentPhone, setStudentPhone] = useState("");

  // ── Promo ───────────────────────────────────────────────────────
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");

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

  // ── Customization Modal ─────────────────────────────────────────
  const [customizingItem, setCustomizingItem] = useState(null);
  const [customizations, setCustomizations] = useState({
    extraCheese: false,
    makeCombo: false,
    extraShami: false,
    extraRaita: false,
    portionSize: "Regular",
    spiceLevel: "Medium",
  });

  // ── Order Tracking (Live) ──────────────────────────────────────
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [isNotifyingRider, setIsNotifyingRider] = useState(false);
  const [isStudentComingNotified, setIsStudentComingNotified] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Trigger continuous un-muteable 5s bell ring / 8s pause loop when rider arrives
  useEffect(() => {
    const statusStr = (activeOrder?.status || "").toLowerCase().trim();
    if (statusStr === "arrived" && !isStudentComingNotified) {
      startArrivalAlertLoop();
    } else {
      stopArrivalAlertLoop();
    }
    return () => {
      stopArrivalAlertLoop();
    };
  }, [activeOrder?.status, isStudentComingNotified]);

  // Reset student coming state when order status changes away from arrived
  useEffect(() => {
    const statusStr = (activeOrder?.status || "").toLowerCase().trim();
    if (statusStr !== "arrived") {
      setIsStudentComingNotified(false);
    }
  }, [activeOrder?.status]);

  const handleNotifyRiderComing = async () => {
    // Immediately stop bell audio ringing & update student UI state
    stopArrivalAlertLoop();
    setIsStudentComingNotified(true);

    const targetOrderId = activeOrder?._id || activeOrder?.id || orderId;

    // Send BroadcastChannel event for instant cross-tab notification
    try {
      const channel = new BroadcastChannel("campus_connect_orders");
      channel.postMessage({
        type: "student_nudge_arrival",
        nudgeType: "student_coming",
        orderId: targetOrderId,
        message: `Student is heading to collect Order ${activeOrder?.orderId || targetOrderId} — they're on their way!`
      });
      channel.close();
    } catch (_) { }

    if (!targetOrderId) {
      showToast("Rider notified! Heading to meetup point.", "success");
      return;
    }

    try {
      setIsNotifyingRider(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      await axios.post(`/api/orders/${targetOrderId}/nudge-rider`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Notification sent! Rider knows you are coming to pick up food.", "success");
    } catch (err) {
      showToast("Rider notified! Heading to meetup point.", "info");
    } finally {
      setIsNotifyingRider(false);
    }
  };

  // ── Auth & Profile Mount ─────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        if (parsed.avatar) setAvatar(parsed.avatar);
      } catch (_) { }
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        if (data.avatar) setAvatar(data.avatar);
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // ── Fetch Restaurants List ───────────────────────────────────────
  const fetchRestaurants = React.useCallback(async () => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return;
    try {
      setIsLoadingRestaurants(true);
      const { data } = await axios.get("/api/canteen/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(err => ({ data: { success: true, restaurants: [] } }));

      let mergedList = [];
      if (data && data.success && Array.isArray(data.restaurants)) {
        mergedList = data.restaurants;
      }

      setRestaurantsList(mergedList);

      const targetId = location.state?.restaurantId;
      const targetName = location.state?.restaurantName;

      let foundIndex = -1;
      if (targetId || targetName) {
        foundIndex = mergedList.findIndex(r =>
          (targetId && (r._id === targetId || r.id === targetId)) ||
          (targetName && r.name && r.name.toLowerCase().includes(String(targetName).toLowerCase())) ||
          (targetId && r.name && r.name.toLowerCase().includes(String(targetId).toLowerCase()))
        );
      }

      if (foundIndex !== -1 && !hasAutoSelectedRef.current) {
        setActiveRestaurant(mergedList[foundIndex]._id || mergedList[foundIndex].id);
        setSelectedVisualIndex(foundIndex);
        hasAutoSelectedRef.current = true;
      }
    } catch (err) {
      setRestaurantsList([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // ── Fetch Restaurant Menu ────────────────────────────────────────
  const fetchMenu = React.useCallback(async () => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token || !activeRestaurant) return;
    try {
      setIsLoadingMenu(true);
      const { data } = await axios.get(`/api/canteen/restaurants/${activeRestaurant}/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => ({ data: { success: false } }));

      if (data && data.success && Array.isArray(data.menu)) {
        setMenuList(data.menu);
      } else {
        setMenuList([]);
      }
    } catch (err) {
      setMenuList([]);
    } finally {
      setIsLoadingMenu(false);
    }
  }, [activeRestaurant]);

  useEffect(() => {
    if (activeRestaurant) {
      fetchMenu();
    }
  }, [activeRestaurant, fetchMenu]);

  // ── Fetch Active/Past Orders ─────────────────────────────────────
  useEffect(() => {
    const fetchPastOrders = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const { data } = await axios.get("/api/canteen/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success && data.orders && data.orders.length > 0) {
          const currentActive = data.orders.find((o) => {
            const s = (o.status || "").toLowerCase().trim();
            return s !== "delivered" && s !== "cancelled" && s !== "completed";
          });
          if (currentActive) {
            setActiveOrder(currentActive);
            setOrderId(currentActive._id);
          } else {
            setActiveOrder(null);
            setOrderId("");
          }
        } else {
          setActiveOrder(null);
          setOrderId("");
        }
      } catch (err) {
        console.error("Error loading past orders:", err);
      }
    };
    if (user) {
      fetchPastOrders();
    }
  }, [user]);

  // ── WebSocket & Cross-Tab Real-Time Tracking ──
  const lastToastStatusRef = React.useRef({ status: "", time: 0 });

  useEffect(() => {
    if (!user) return;

    const handleIncomingStatus = (status, msg) => {
      if (!status) return;
      const sKey = getNormalizedStatus(status);
      if (!sKey) return; // Do not mutate status on student_coming nudges

      // Prevent duplicate toast popups within 3 seconds for same status key
      const now = Date.now();
      const isDuplicate = lastToastStatusRef.current.status === sKey && (now - lastToastStatusRef.current.time < 3000);
      if (!isDuplicate) {
        lastToastStatusRef.current = { status: sKey, time: now };

        if (sKey === "ready") {
          showToast(msg || "Order Ready! Your food is cooked & packed at the canteen.", "success");
        } else if (sKey === "on_the_way" || sKey === "accepted") {
          showToast(msg || "Rider On The Way! Rider has picked up your food.", "info");
        } else if (sKey === "arrived") {
          showToast(msg || "Rider Arrived! Rider has reached your location. Please receive your food.", "info");
        } else if (sKey === "completed" || sKey === "delivered") {
          showToast(msg || "Order Delivered! Enjoy your meal.", "success");
        } else if (sKey === "cancelled") {
          showToast(msg || "Order Cancelled. We apologize for the inconvenience.", "error");
        }
      }

      if (sKey === "completed" || sKey === "delivered" || sKey === "cancelled") {
        stopArrivalAlertLoop();
        setTimeout(() => {
          setActiveOrder(null);
          setOrderId("");
          setCart([]);
          localStorage.removeItem("active_canteen_order");
        }, 2000);
      } else {
        setActiveOrder((prev) => {
          if (prev && prev.status === sKey) return prev;
          const updated = { ...(prev || {}), status: sKey };
          localStorage.setItem("active_canteen_order", JSON.stringify(updated));
          return updated;
        });
      }
    };

    // 1. Socket.io
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const joinUser = () => {
      const uId = user?._id || user?.id;
      if (uId) {
        socket.emit("join_user_room", uId.toString());
        socket.emit("join_room", uId.toString());
      }
    };

    socket.on("connect", joinUser);
    joinUser();

    socket.on("order_status_update", (data) => {
      handleIncomingStatus(data.status, data.message);
      // Show OS-level browser notification when tab is minimized
      showOrderStatusNotification(data.status, data.message);
    });

    socket.on("order_arrived", (data) => {
      handleIncomingStatus("arrived", data.message);
      showOrderStatusNotification("arrived", data.message);
    });

    socket.on("order_delivered", (data) => {
      handleIncomingStatus("completed", data.message);
      showOrderStatusNotification("completed", data.message);
    });

    socket.on("restaurant_status_update", (data) => {
      fetchRestaurants();
      if (data && data.restaurantId) {
        const targetId = data.restaurantId.toString();
        const activeId = activeRestaurant ? activeRestaurant.toString() : "";
        if (activeId && targetId === activeId && data.isActive === false) {
          showToast("⚠️ This restaurant has just closed and is no longer accepting orders.", "warning");
          setMenuList([]);
          setActiveRestaurant("");
        } else if (activeRestaurant) {
          fetchMenu();
        }
      } else if (activeRestaurant) {
        fetchMenu();
      }
    });

    socket.on("restaurant_menu_update", () => {
      if (activeRestaurant) fetchMenu();
    });

    socket.on("restaurant_updated", () => {
      fetchRestaurants();
    });


    // 2. BroadcastChannel for Instant Cross-Tab Communication
    let channel;
    try {
      channel = new BroadcastChannel("campus_connect_orders");
      channel.onmessage = (event) => {
        if (event.data && event.data.type === "student_nudge_arrival") return;
        if (event.data && event.data.status) {
          handleIncomingStatus(event.data.status, event.data.message);
        }
      };
    } catch (e) { }

    // 3. Storage event for cross-tab local storage changes
    const handleStorageChange = (e) => {
      if (e.key === "active_canteen_order" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.status) {
            handleIncomingStatus(parsed.status);
          }
        } catch (err) { }
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      socket.disconnect();
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, showToast, fetchRestaurants, fetchMenu, activeRestaurant]);

  // ── Avatar Upload ─────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    setIsUploading(true);
    const token = sessionStorage.getItem("token");
    if (!token) { setIsUploading(false); return; }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const { data } = await axios.put("/api/auth/update-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      if (data.avatar) {
        setAvatar(data.avatar);
        const stored = sessionStorage.getItem("user");
        if (stored) {
          const u = JSON.parse(stored);
          const updated = { ...u, avatar: data.avatar };
          setUser(updated);
          sessionStorage.setItem("user", JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const stored = sessionStorage.getItem("user");
      if (stored) setAvatar(JSON.parse(stored).avatar || null);
    } finally {
      setIsUploading(false);
    }
  };

  const getPersonalizedAvatar = (url) => {
    if (!url || url.includes("name=User"))
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    return url;
  };

  // Helper to check if a menu item is marked unavailable / out of stock
  const isItemUnavailable = (item) => {
    if (!item) return false;
    if (item.isAvailable === false || item.isAvailable === "false" || item.isAvailable === 0) return true;
    if (item.status === "Inactive" || item.status === "Unavailable" || item.status === "Out of Stock") return true;
    return false;
  };

  // ── Cart Helpers ──────────────────────────────────────────────────
  const handleAddToCart = (item) => {
    if (isItemUnavailable(item)) {
      showToast(`⚠️ Item Out of Stock: "${item.name}" is currently unavailable!`, "warning");
      return;
    }
    const itemId = item._id || item.id;
    setCart((prev) => {
      const ex = prev.find((ci) => ci.id === itemId);
      if (ex) return prev.map((ci) => ci.id === itemId ? { ...ci, qty: ci.qty + 1 } : ci);
      return [...prev, { ...item, id: itemId, qty: 1 }];
    });
  };

  const handleAddToCartClick = (item) => {
    if (isItemUnavailable(item)) {
      showToast(`⚠️ Item Out of Stock: "${item.name}" is currently unavailable!`, "warning");
      return;
    }
    const itemCategory = item.category || (item.name.toLowerCase().match(/(burger|sandwich|pizza|zinger|fries|roll)/) ? "Fast Food" : "Other");
    if (itemCategory === "Fast Food" || itemCategory === "Traditional") {
      setCustomizingItem(item);
      setCustomizations({ extraCheese: false, makeCombo: false, extraShami: false, extraRaita: false, portionSize: "Regular", spiceLevel: "Medium" });
    } else {
      handleAddToCart(item);
    }
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    if (isItemUnavailable(customizingItem)) {
      showToast(`⚠️ Item Out of Stock: "${customizingItem.name}" is currently unavailable!`, "warning");
      setCustomizingItem(null);
      return;
    }
    let extra = 0;
    const notes = [];
    const itemCategory = customizingItem.category || (customizingItem.name.toLowerCase().match(/(burger|sandwich|pizza|zinger|fries|roll)/) ? "Fast Food" : "Other");

    if (itemCategory === "Fast Food") {
      if (customizations.extraCheese) { extra += 40; notes.push("Extra Cheese (+Rs.40)"); }
      if (customizations.makeCombo) { extra += 150; notes.push("Combo (Fries + Drink) (+Rs.150)"); }
      if (customizations.spiceLevel !== "Medium") notes.push(`Spice: ${customizations.spiceLevel}`);
    } else {
      if (customizations.extraShami) { extra += 70; notes.push("Extra Shami (+Rs.70)"); }
      if (customizations.extraRaita) { extra += 30; notes.push("Extra Raita (+Rs.30)"); }
      if (customizations.portionSize === "Double") { extra += 100; notes.push("Double Portion (+Rs.100)"); }
    }
    const baseId = customizingItem._id || customizingItem.id;
    setCart((prev) => [...prev, { ...customizingItem, id: `${baseId}-${Date.now()}`, price: customizingItem.price + extra, customNotes: notes.join(", "), qty: 1 }]);
    setCustomizingItem(null);
  };

  const handleAdjustQty = (id, change) => {
    if (change > 0) {
      const cartItem = cart.find((ci) => ci.id === id || ci._id === id);
      const menuItem = menuList.find((m) => (m._id || m.id) === id || m.name === cartItem?.name);
      if (isItemUnavailable(cartItem) || isItemUnavailable(menuItem)) {
        showToast(`⚠️ Item Out of Stock: "${cartItem?.name || menuItem?.name || 'Item'}" is currently unavailable!`, "warning");
        return;
      }
    }
    setCart((prev) => prev.map((ci) => ci.id === id ? { ...ci, qty: ci.qty + change } : ci).filter((ci) => ci.qty > 0));
  };

  const handleClearCart = () => setCart([]);

  const toggleFavorite = (id) => setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Pricing ───────────────────────────────────────────────────────
  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.price * ci.qty, 0);
  const deliveryThreshold = 500;
  const isFreeDelivery = cartSubtotal >= deliveryThreshold || orderType === "pickup";
  let platformFee = cart.length > 0 ? (isFreeDelivery ? 0 : 45) : 0;
  let discountAmount = 0;

  if (appliedPromo) {
    if (appliedPromo.code === "WELCOME50" && cartSubtotal >= 300) { discountAmount = 50; }
    else if (appliedPromo.code === "FREEPASS" && cartSubtotal >= 200) { discountAmount = platformFee; platformFee = 0; }
    else if (appliedPromo.code === "STUDENT15" && cartSubtotal >= 250) { discountAmount = Math.min(150, Math.round(cartSubtotal * 0.15)); }
  }

  const gstTax = Math.round((cartSubtotal - discountAmount) * 0.16);
  const cartTotal = Math.max(0, cartSubtotal + platformFee + gstTax - (appliedPromo?.code === "FREEPASS" ? 0 : discountAmount));

  // ── Promo ─────────────────────────────────────────────────────────
  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    const code = promoCode.trim().toUpperCase();
    if (code === "WELCOME50") {
      if (cartSubtotal < 300) {
        setPromoError("Min Rs. 300 required.");
      } else {
        setAppliedPromo({ code, discount: 50, desc: "Rs. 50 Discount Applied!" });
        setPromoError("");
      }
    } else if (code === "FREEPASS") {
      if (cartSubtotal < 200) {
        setPromoError("Min Rs. 200 required.");
      } else {
        setAppliedPromo({ code, discount: 45, desc: "Free Delivery unlocked!" });
        setPromoError("");
      }
    } else if (code === "STUDENT15") {
      if (cartSubtotal < 250) {
        setPromoError("Min Rs. 250 required.");
      } else {
        setAppliedPromo({ code, discount: Math.min(150, Math.round(cartSubtotal * 0.15)), desc: "15% Off applied!" });
        setPromoError("");
      }
    } else {
      setPromoError("Invalid coupon code!");
    }
  };
  const handleRemovePromo = () => { setAppliedPromo(null); setPromoCode(""); setPromoError(""); };

  // ── Checkout (Live API call) ─────────────────────────────────────
  const handleCheckout = async () => {
    if (isSubmittingOrder || cart.length === 0) return;
    const activeResObj = restaurantsList.find(r => (r._id || r.id) === activeRestaurant || r.owner === activeRestaurant);
    if (activeResObj && activeResObj.isActive === false) {
      showToast(`⚠️ "${activeResObj.name || 'This restaurant'}" is currently closed and not accepting orders.`, "warning");
      return;
    }
    setIsSubmittingOrder(true);
    const token = sessionStorage.getItem("token");

    const activeResName = restaurantsList.find(r => (r._id || r.id) === activeRestaurant)?.name || "Campus Canteen";
    const newOrderObj = {
      _id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      restaurantName: activeResName,
      canteenName: activeResName,
      items: cart.map((ci) => ({ name: ci.name, quantity: ci.qty, price: ci.price })),
      totalAmount: cartTotal,
      status: "preparing",
      createdAt: new Date().toISOString()
    };

    try {
      if (token) {
        const orderPayload = {
          restaurantId: activeRestaurant,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
          })),
          totalAmount: cartTotal,
          studentPhone: studentPhone,
        };

        const { data } = await axios.post("/api/canteen/orders", orderPayload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data && data.success && data.order) {
          setActiveOrder(data.order);
          setOrderId(data.order.orderId || data.order._id);
        } else {
          setActiveOrder(newOrderObj);
          setOrderId(newOrderObj._id);
        }
      } else {
        setActiveOrder(newOrderObj);
        setOrderId(newOrderObj._id);
      }

      setCart([]);
      handleRemovePromo();
      setActiveTab("track");
      setIsTrackingOpen(false);
      showToast("Order placed successfully! Delivery tracking is now live.", "success");
    } catch (err) {
      console.error("Error creating order:", err);
      showToast(err.response?.data?.message || "Failed to create order.", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // ── Helper to determine food category dynamically ─────────────────
  const getItemCategory = (item) => {
    if (item.category) return item.category;
    const nameLower = item.name.toLowerCase();
    const descLower = (item.description || "").toLowerCase();
    if (nameLower.match(/(burger|sandwich|pizza|zinger|fries|roll|patties|nugget)/) || descLower.match(/(burger|sandwich|pizza|zinger|fries|roll|patties|nugget)/)) return "Fast Food";
    if (nameLower.match(/(pulao|biryani|kabab|roast|naan|raita|gravy|karahi|daal|sabzi)/) || descLower.match(/(pulao|biryani|kabab|roast|naan|raita|gravy|karahi|daal|sabzi)/)) return "Traditional";
    if (nameLower.match(/(tea|coffee|coke|sprite|fanta|water|juice|soda|drink|shake)/) || descLower.match(/(tea|coffee|coke|sprite|fanta|water|juice|soda|drink|shake)/)) return "Beverages";
    return "Fast Food";
  };

  // Helper to normalize status strings to standardized keys
  const getNormalizedStatus = (rawStatus) => {
    if (!rawStatus) return "preparing";
    const s = String(rawStatus).toLowerCase().trim();
    if (s === "student_coming" || s === "student_nudge_arrival") return null;
    if (s === "cancelled" || s === "rejected") return "cancelled";
    if (s === "pending" || s === "accepted" || s === "preparing" || s === "placed" || s === "new") return "preparing";
    if (s === "ready" || s === "dispatched" || s === "food_ready" || s === "order_ready") return "ready";
    if (s === "on_the_way" || s === "on-the-way" || s === "in_transit" || s === "on the way" || s === "picked_up" || s === "pickedup") return "on_the_way";
    if (s === "arrived" || s === "at_location" || s === "rider_arrived" || s === "location") return "arrived";
    if (s === "completed" || s === "delivered") return "completed";
    return s;
  };

  // ── Filtered Menu ─────────────────────────────────────────────────
  const filteredMenu = menuList.filter((item) => {
    const itemCat = getItemCategory(item);
    const matchCat = selectedCategory === "All" || itemCat === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeResObj = restaurantsList.find(
    (r) => (r._id || r.id) === activeRestaurant || r.owner === activeRestaurant || (activeOrder && (r._id === activeOrder.restaurant || r.name === activeOrder.restaurantName))
  );
  const currentResPhone = activeResObj?.phone || "+923001234567";
  const currentResName = activeResObj?.name || activeOrder?.restaurantName || activeOrder?.canteenName || "Campus Canteen";

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen w-full max-w-full overflow-hidden flex-col gap-3.5 bg-[#faf8f5]">
        <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
        <p className="font-sans text-slate-500 text-[14.5px] font-semibold">Loading canteen...</p>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#faf8f5] font-sans text-slate-800">
      <div className="flex flex-1 min-w-0 w-full h-full animate-fade-in overflow-hidden">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
          <Topbar
            time={time}
            user={user}
            setUser={setUser}
            avatar={getPersonalizedAvatar(avatar)}
            handleAvatarChange={handleAvatarChange}
            isUploading={isUploading}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          <div className="flex-1 px-8 py-7 flex flex-col gap-6 max-md:p-4">

            {/* ── HERO / HEADER / TABS ── */}
            <CanteenHero
              user={user}
              orderType={orderType}
              setOrderType={setOrderType}
              deliveryLocation={deliveryLocation}
              setDeliveryLocation={setDeliveryLocation}
              CAMPUS_LOCATIONS={CAMPUS_LOCATIONS}
              isLocationDropdownOpen={isLocationDropdownOpen}
              setIsLocationDropdownOpen={setIsLocationDropdownOpen}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* ── STICKY RIDER ARRIVAL ALERT BANNER ── */}
            {activeOrder && (activeOrder.status === "arrived" || (activeOrder.status || "").toLowerCase().includes("arrived")) && (
              <div className={`sticky top-4 z-50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-2xl border-2 transition-all duration-300 ${isStudentComingNotified
                  ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-300"
                  : "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white border-amber-300 animate-pulse"
                }`}>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-xl shadow-inner shrink-0">
                    <i className={`fa-solid ${isStudentComingNotified ? "fa-person-running" : "fa-location-dot"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isStudentComingNotified ? "bg-white text-emerald-800" : "bg-white text-red-700"
                        }`}>
                        {isStudentComingNotified ? "Student On The Way" : "Rider at Delivery Location"}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${isStudentComingNotified ? "text-emerald-100" : "text-amber-200"}`}>
                        <i className="fa-solid fa-bell text-[10px]" />
                        <span>{isStudentComingNotified ? "Bell Stopped • Rider Notified" : "Continuous Alert Active (5s Ring • 8s Pause)"}</span>
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-white mt-1 m-0 flex items-center gap-1.5">
                      <span>{isStudentComingNotified ? "Rider Notified! You are heading out to collect food" : "Rider Has Arrived! Please collect your order!"}</span>
                      <i className="fa-solid fa-motorcycle text-xs" />
                    </h4>
                    <p className={`text-xs font-medium mt-0.5 m-0 ${isStudentComingNotified ? "text-emerald-100" : "text-rose-100"}`}>
                      {isStudentComingNotified
                        ? "Rider knows you are coming. Meet your rider at the designated campus delivery location."
                        : "Your food is ready at the delivery location. Meet your rider to receive it."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleNotifyRiderComing}
                    disabled={isNotifyingRider || isStudentComingNotified}
                    className={`flex-1 sm:flex-none px-5 py-3 rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 border-2 ${isStudentComingNotified
                        ? "bg-white/20 text-white border-white/40 cursor-default"
                        : "bg-white text-rose-700 hover:bg-rose-50 border-amber-200 cursor-pointer active:scale-95"
                      }`}
                  >
                    {isStudentComingNotified ? (
                      <>
                        <i className="fa-solid fa-circle-check text-xs" />
                        <span>Rider Notified (On My Way)</span>
                      </>
                    ) : isNotifyingRider ? (
                      <span>Notifying Rider...</span>
                    ) : (
                      <>
                        <i className="fa-solid fa-person-running text-xs" />
                        <span>I'm Coming to Pick Up! (Notify Rider)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── BROWSE TAB: STEP 1 (RESTAURANTS ONLY) VS STEP 2 (MENU + CART) ── */}
            {activeTab === "browse" && (
              !activeRestaurant ? (
                /* STEP 1: ONLY ALL RESTAURANTS GRID SHOWS INITIALLY */
                <div className="flex flex-col gap-6 animate-fade-in">
                  <RestaurantList
                    restaurants={restaurantsList}
                    activeRestaurant={activeRestaurant}
                    setActiveRestaurant={setActiveRestaurant}
                    setSelectedCategory={setSelectedCategory}
                    selectedVisualIndex={selectedVisualIndex}
                    setSelectedVisualIndex={setSelectedVisualIndex}
                    showToast={showToast}
                  />
                </div>
              ) : (
                /* STEP 2: SELECTED RESTAURANT MENU & CART VIEW */
                <div className="flex flex-col gap-6 animate-fade-in">
                  {/* Selected Restaurant Card Banner (Matching Forum & Career design) */}
                  <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#071A35] text-white border border-[#071A35] shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col md:flex-row items-start md:items-center justify-between p-5 sm:p-7 gap-4 sm:gap-6 w-full">
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 flex-1 z-10 min-w-0 w-full">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-slate-100 relative">
                        <img
                          src={activeResObj?.coverImage || activeResObj?.owner?.avatar || activeResObj?.avatar || activeResObj?.image || ""}
                          alt={activeResObj?.name || "Selected Restaurant"}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase shadow-xs">
                          Open
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-[9px] sm:text-[10px] uppercase font-black text-[#00c2cb] bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full tracking-wider">
                            Selected Canteen
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-white/70">
                            • 15-25 min prep
                          </span>
                        </div>

                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight break-words">
                          {activeResObj?.name || "Campus Canteen"}
                        </h2>

                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-semibold text-white/80 flex-wrap mt-0.5">
                          <div className="flex items-center gap-1 bg-white/10 text-[#00c2cb] px-2 py-0.5 rounded-lg border border-white/10 font-black text-[10px] sm:text-[11px]">
                            <i className="fa-solid fa-star text-amber-400 text-[10px]" />
                            <span>4.8</span>
                          </div>
                          <span className="hidden sm:inline">Campus Favorite</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-[#00c2cb] font-bold">Live Menu Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center self-stretch md:self-center z-10 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => setActiveRestaurant("")}
                        className="w-full md:w-auto flex items-center justify-center gap-2 text-xs font-black text-[#071A35] hover:bg-[#00a8b5] bg-[#00c2cb] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer border-none shadow-md group"
                      >
                        <i className="fa-solid fa-arrow-left group-hover:-translate-x-0.5 transition-transform" />
                        <span>Select Another Canteen</span>
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Grid: Menu Board + Checkout Cart (Stacks cleanly under 1024px to avoid overflow) */}
                  <div className="grid grid-cols-1 lg:grid-cols-[auto_260px] xl:grid-cols-[auto_300px] justify-center gap-4 sm:gap-6 items-start w-full min-w-0">
                    <MenuBoard
                      popularDishes={POPULAR_DISHES}
                      restaurants={restaurantsList}
                      activeRestaurant={activeRestaurant}
                      filteredMenu={filteredMenu}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      categories={(() => {
                        const cats = Array.from(new Set((menuList || []).map((i) => i.category).filter(Boolean)));
                        const list = [{ name: "All", iconClass: "fa-solid fa-utensils", bgColor: "bg-[#00c2cb]/10", textColor: "text-[#0079c2]" }];
                        cats.forEach((catName) => {
                          let iconClass = "fa-solid fa-bowl-food";
                          const lower = catName.toLowerCase();
                          if (lower.includes("burger")) iconClass = "fa-solid fa-burger";
                          else if (lower.includes("pizza")) iconClass = "fa-solid fa-pizza-slice";
                          else if (lower.includes("pasta") || lower.includes("noodle")) iconClass = "fa-solid fa-bowl-rice";
                          else if (lower.includes("beverage") || lower.includes("drink") || lower.includes("tea") || lower.includes("coffee")) iconClass = "fa-solid fa-mug-hot";
                          else if (lower.includes("dessert") || lower.includes("cake") || lower.includes("sweet")) iconClass = "fa-solid fa-ice-cream";
                          list.push({
                            name: catName,
                            iconClass,
                            bgColor: "bg-slate-50",
                            textColor: "text-slate-700"
                          });
                        });
                        return list.length > 1 ? list : CATEGORIES;
                      })()}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      handleAddToCartClick={handleAddToCartClick}
                      deals={DEALS}
                      setActiveRestaurant={setActiveRestaurant}
                      selectedVisualIndex={selectedVisualIndex}
                      setSelectedVisualIndex={setSelectedVisualIndex}
                      cart={cart}
                      handleAdjustQty={handleAdjustQty}
                    />

                    <CheckoutCart
                      cart={cart}
                      cartSubtotal={cartSubtotal}
                      cartTotal={cartTotal}
                      gstTax={gstTax}
                      platformFee={platformFee}
                      discountAmount={discountAmount}
                      appliedPromo={appliedPromo}
                      promoCode={promoCode}
                      setPromoCode={setPromoCode}
                      promoError={promoError}
                      handleApplyPromo={handleApplyPromo}
                      handleRemovePromo={handleRemovePromo}
                      handleAdjustQty={handleAdjustQty}
                      handleClearCart={handleClearCart}
                      handleCheckout={handleCheckout}
                      isFreeDelivery={isFreeDelivery}
                      deliveryThreshold={deliveryThreshold}
                      studentPhone={studentPhone}
                      setStudentPhone={setStudentPhone}
                      isSubmittingOrder={isSubmittingOrder}
                    />
                  </div>
                </div>
              )
            )}

            {/* ── TRACK TAB ── */}
            {activeTab === "track" && (
              <div className="grid grid-cols-[1fr_330px] gap-8 max-[1100px]:grid-cols-1">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-[#0a2342] via-[#0f2e54] to-[#0a2342] p-6 flex flex-col gap-3 text-white border border-[#00c2cb]/30">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#00c2cb] bg-[#00c2cb]/15 px-3 py-1 rounded-full border border-[#00c2cb]/30 flex items-center gap-1.5">
                          <i className="fa-solid fa-motorcycle text-xs" />
                          <span>Live Active Order Tracking</span>
                        </span>
                        {activeOrder && (
                          <span className="text-xs font-black text-[#00c2cb]">
                            #{activeOrder._id ? String(activeOrder._id).slice(-6).toUpperCase() : "LIVE"}
                          </span>
                        )}
                      </div>

                      <h2 className="text-[20px] font-black text-white leading-tight">
                        {activeOrder ? (activeOrder.canteenName || activeOrder.restaurantName || activeOrder.restaurant?.name || DEFAULT_CANTEENS.find(c => c._id === (activeOrder.restaurant?._id || activeOrder.restaurant))?.name || "Campus Canteen") : "Canteen Active Order"}
                      </h2>
                      <p className="text-[12px] text-slate-300 font-medium">
                        Real-time status updates: Kitchen Preparation / Food Ready / Rider Picked Up / Arrival at Location
                      </p>
                    </div>

                    {activeOrder ? (
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6">
                        {/* Order Info Header */}
                        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-100">
                          <div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase">Canteen Vendor</div>
                            <div className="text-base font-black text-[#0a2342]">
                              {activeOrder.canteenName || activeOrder.restaurantName || activeOrder.restaurant?.name || DEFAULT_CANTEENS.find(c => c._id === (activeOrder.restaurant?._id || activeOrder.restaurant))?.name || "Campus Canteen"}
                            </div>
                            <div className="text-xs text-slate-500 font-semibold mt-0.5">
                              {activeOrder.items && activeOrder.items.length > 0
                                ? activeOrder.items.map(it => `${it.quantity || 1}x ${it.name}`).join(", ")
                                : "Canteen Meal Items"}
                            </div>
                          </div>

                          <div className="text-right max-sm:text-left">
                            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Amount</div>
                            <div className="text-xl font-black text-[#00c2cb]">
                              Rs. {activeOrder.totalAmount || activeOrder.total || 350}
                            </div>
                          </div>
                        </div>

                        {/* ── Status Progress Bar Timeline ── */}
                        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { id: "preparing", label: "Preparing", icon: "fa-solid fa-fire-burner" },
                              { id: "ready", label: "Order Ready", icon: "fa-solid fa-box-open" },
                              { id: "on_the_way", label: "Rider On Way", icon: "fa-solid fa-motorcycle" },
                              { id: "arrived", label: "Rider at Location", icon: "fa-solid fa-location-dot" },
                            ].map((step, idx) => {
                              const currentKey = getNormalizedStatus(activeOrder.status);
                              const getStepIdx = (st) => {
                                if (st === "preparing") return 0;
                                if (st === "ready") return 1;
                                if (st === "on_the_way") return 2;
                                if (st === "arrived" || st === "completed") return 3;
                                return 0;
                              };
                              const activeIdx = getStepIdx(currentKey);
                              const isActive = idx === activeIdx;
                              const isPassed = idx < activeIdx;

                              return (
                                <div key={step.id} className="flex flex-col items-center text-center">
                                  <div
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${isActive
                                      ? "bg-[#00c2cb] text-[#0a2342] scale-110 shadow-[0_0_15px_rgba(0,194,203,0.5)] ring-4 ring-[#00c2cb]/20"
                                      : isPassed
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-200 text-slate-400"
                                      }`}
                                  >
                                    {isPassed ? <i className="fa-solid fa-check" /> : <i className={step.icon} />}
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold mt-2 ${isActive ? "text-[#00c2cb] font-black" : isPassed ? "text-emerald-600" : "text-slate-400"
                                      }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Current Live Status Banner */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0a2342] to-[#0f2e54] text-white flex items-center gap-4 shadow-md">
                          <div className="text-2xl text-[#00c2cb] animate-bounce">
                            {getNormalizedStatus(activeOrder.status) === "preparing" && <i className="fa-solid fa-fire-burner" />}
                            {getNormalizedStatus(activeOrder.status) === "ready" && <i className="fa-solid fa-box-open" />}
                            {getNormalizedStatus(activeOrder.status) === "on_the_way" && <i className="fa-solid fa-motorcycle" />}
                            {getNormalizedStatus(activeOrder.status) === "arrived" && <i className="fa-solid fa-location-dot" />}
                            {getNormalizedStatus(activeOrder.status) === "completed" && <i className="fa-solid fa-circle-check text-emerald-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase text-[#00c2cb]">Current Status:</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#00c2cb]/20 text-[#00c2cb] border border-[#00c2cb]/30 text-[10px] font-black uppercase">
                                {getNormalizedStatus(activeOrder.status) === "preparing" && "Preparing Food"}
                                {getNormalizedStatus(activeOrder.status) === "ready" && "Order Ready!"}
                                {getNormalizedStatus(activeOrder.status) === "on_the_way" && "Rider On The Way"}
                                {getNormalizedStatus(activeOrder.status) === "arrived" && "Rider Arrived at Location!"}
                                {getNormalizedStatus(activeOrder.status) === "completed" && "Delivered"}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-200 mt-1 m-0">
                              {getNormalizedStatus(activeOrder.status) === "preparing" && "Kitchen has received your order and is currently preparing your meal."}
                              {getNormalizedStatus(activeOrder.status) === "ready" && "Khana canteen par ready ho gaya hai! Waiting for rider pickup."}
                              {getNormalizedStatus(activeOrder.status) === "on_the_way" && "Rider order le kar aap ki location ki taraf aa raha hai!"}
                              {getNormalizedStatus(activeOrder.status) === "arrived" && "Rider aap ki location par pohnch gaya hai! Kripya food receive karein."}
                              {getNormalizedStatus(activeOrder.status) === "completed" && "Order has been delivered successfully. Enjoy your meal!"}
                            </p>
                          </div>
                        </div>



                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <a
                            href={`https://wa.me/${(restaurantsList.find(r => r._id === activeOrder?.restaurant || r._id === activeRestaurant)?.phone || "+923001234567").replace(/[^0-9+]/g, "")}?text=${encodeURIComponent("Hi! I would like to track my order ID " + (activeOrder?._id || ""))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none py-2.5 px-5 rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all shadow-md no-underline"
                          >
                            <i className="fa-brands fa-whatsapp text-sm" />
                            <span>Contact via WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-16 h-16 rounded-full bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-3xl mb-1">
                          <i className="fa-solid fa-motorcycle" />
                        </div>
                        <h3 className="text-base font-black text-[#0a2342]">No Active Order Currently</h3>
                        <p className="text-xs text-slate-500 font-semibold max-w-sm m-0">
                          You don't have an active canteen order right now. Select a restaurant and place an order from the Browse Menu tab to track it here live!
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <CheckoutCart
                  cart={cart}
                  cartSubtotal={cartSubtotal}
                  cartTotal={cartTotal}
                  gstTax={gstTax}
                  platformFee={platformFee}
                  discountAmount={discountAmount}
                  appliedPromo={appliedPromo}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  promoError={promoError}
                  handleApplyPromo={handleApplyPromo}
                  handleRemovePromo={handleRemovePromo}
                  handleAdjustQty={handleAdjustQty}
                  handleClearCart={handleClearCart}
                  handleCheckout={handleCheckout}
                  isFreeDelivery={isFreeDelivery}
                  deliveryThreshold={deliveryThreshold}
                  studentPhone={studentPhone}
                  setStudentPhone={setStudentPhone}
                  isSubmittingOrder={isSubmittingOrder}
                />
              </div>
            )}

            {/* ── FOOTER ── */}
            <footer className="mt-4 py-4 border-t border-slate-200 text-center">
              <p className="text-[11.5px] text-slate-400 font-semibold tracking-wide">
                © 2026 CampusConnect. An idea by{" "}
                <span className="text-[#0a2342] font-black">Mr. Sagheer Ahmad</span> &{" "}
                <span className="text-[#0a2342] font-black">Mr. Shujaat Ali Hashim</span>
              </p>
            </footer>
          </div>
        </main>
      </div>

      {/* ── MODALS ── */}
      <AddonModal
        customizingItem={customizingItem}
        setCustomizingItem={setCustomizingItem}
        customizations={customizations}
        setCustomizations={setCustomizations}
        handleConfirmCustomization={handleConfirmCustomization}
      />

      <OrderTracker
        isTrackingOpen={isTrackingOpen}
        setIsTrackingOpen={setIsTrackingOpen}
        orderId={orderId}
        restaurantPhone={currentResPhone}
        restaurantName={currentResName}
        studentId={user?._id || user?.id}
      />

      {/* ── TOAST NOTIFICATION (Ultra Compact) ── */}
      {toast && (
        <div className={`fixed top-24 sm:top-28 right-3 sm:right-6 w-max max-w-[320px] sm:max-w-[400px] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-4 py-3 shadow-xl z-[3000] flex items-start gap-2.5 animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-4 border-l-amber-500' : toast.type === 'error' ? 'border-l-4 border-l-red-500' : toast.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-[#00c2cb]'}`}>
          <div className="text-sm shrink-0 mt-0.5">
            {toast.type === 'warning' && <i className="fa-solid fa-triangle-exclamation text-amber-500" />}
            {toast.type === 'error' && <i className="fa-solid fa-circle-xmark text-rose-500" />}
            {toast.type === 'success' && <i className="fa-solid fa-circle-check text-emerald-500" />}
            {toast.type === 'info' && <i className="fa-solid fa-circle-info text-[#00c2cb]" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#0a2342] leading-snug">{toast.message}</p>
          </div>
          <button className="text-xs font-black text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-none p-0.5 shrink-0 leading-none" onClick={() => setToast(null)}>
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
