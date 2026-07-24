import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/helpers";

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
import CanteenReview from "./components/CanteenReview";
// Assets

// ─── DATA ────────────────────────────────────────────────────────────────────

const POPULAR_DISHES = [
  { id: "sav1", name: "Chicken Pulao Kabab", price: 380, rating: 4.8, reviews: 145, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80", category: "Traditional", desc: "Savour's legendary fragrant basmati rice served with two shami kababs and tender chicken piece.", restaurantId: "sav" },
  { id: "gour3", name: "Club Sandwich", price: 280, rating: 4.6, reviews: 110, image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80", category: "Fast Food", desc: "Gourmet's signature double-decker sandwich with chicken, egg, mayo, and lettuce.", restaurantId: "gour" },
  { id: "jj1", name: "Wehshi Burger", price: 390, rating: 4.7, reviews: 230, image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80", category: "Fast Food", desc: "Johnny & Jugnu's famous crispy chicken fillet burger with Wehshi hot sauce.", restaurantId: "jj" },
  { id: "dog1", name: "Special Chicken Biryani", price: 320, rating: 4.5, reviews: 95, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80", category: "Traditional", desc: "Lahori-style spicy chicken biryani with boiled egg and raita.", restaurantId: "dog" },
];

const DEALS = [
  { id: "d1", tag: "20% OFF", title: "Biryani Bonanza", desc: "Get 20% off on all biryani orders", price: 224, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80", category: "Traditional", name: "Biryani Bonanza Deal", restaurantId: "sav" },
  { id: "d2", tag: "COMBO DEAL", title: "Burger + Fries + Drink", desc: "Awesome combo at just Rs. 299 only", price: 299, image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80", category: "Fast Food", name: "Burger Combo Deal", restaurantId: "gour" },
  { id: "d3", tag: "15% OFF", title: "Weekend Special", desc: "Flat 15% off on all orders above Rs. 700", price: 799, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", category: "Fast Food", name: "Weekend Pizza Deal Platter", restaurantId: "dog" },
];



const CAMPUS_LOCATIONS = [
  "CS Department (Ground Floor)",
  "Central Library (Study Area)",
  "Admin Block (Main Reception)",
  "Hostel Block A (Room 105)",
  "Hostel Block B (Room 214)",
  "Main Playground Cafe",
];

const INITIAL_REVIEWS = [
  { name: "Muhammad Bilal", canteenName: "Cafe Aroma", rating: 5, comment: "Cafe Aroma is always consistent. Fast service even during peak lunch hours!", date: "2026-05-29" },
  { name: "Zoya Sheikh", canteenName: "Spice Junction", rating: 4, comment: "Spice Junction has the best club sandwiches on campus. A bit pricey but worth it.", date: "2026-05-28" },
  { name: "Usama Syed", canteenName: "Food Hub", rating: 3, comment: "Food Hub is delicious, but sometimes they take over 25 minutes to prepare.", date: "2026-05-27" },
];

const CATEGORIES = [
  { name: "All", icon: "🍽️", bgColor: "bg-[#e2725b]/10", textColor: "text-[#e2725b]" },
  { name: "Fast Food", icon: "🍔", bgColor: "bg-orange-50", textColor: "text-orange-500" },
  { name: "Traditional", icon: "🍛", bgColor: "bg-red-50", textColor: "text-red-500" },
  { name: "Beverages", icon: "🥤", bgColor: "bg-blue-50", textColor: "text-blue-500" },
  { name: "Desserts", icon: "🍰", bgColor: "bg-pink-50", textColor: "text-pink-500" },
];

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

  // ── Reviews ─────────────────────────────────────────────────────
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  // ── Order Tracking (Live) ──────────────────────────────────────
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderId, setOrderId] = useState("");

  // ── Auth & Profile Mount ─────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setNewReviewName(parsed.name);
        if (parsed.avatar) setAvatar(parsed.avatar);
      } catch (_) { }
    }

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setNewReviewName(data.name);
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
  useEffect(() => {
    const fetchRestaurants = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        setIsLoadingRestaurants(true);
        const { data } = await axios.get("/api/canteen/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setRestaurantsList(data.restaurants || []);
          const initialResId = location.state?.restaurantId || data.restaurants[0]?._id;
          if (initialResId) {
            setActiveRestaurant(initialResId);
          }
        }
      } catch (err) {
        console.error("Error loading restaurants:", err);
      } finally {
        setIsLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, [location.state?.restaurantId]);

  // ── Fetch Restaurant Menu ────────────────────────────────────────
  useEffect(() => {
    const fetchMenu = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !activeRestaurant) return;
      try {
        setIsLoadingMenu(true);
        const { data } = await axios.get(`/api/canteen/restaurants/${activeRestaurant}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setMenuList(data.menu || []);
        }
      } catch (err) {
        console.error("Error loading restaurant menu:", err);
      } finally {
        setIsLoadingMenu(false);
      }
    };

    if (activeRestaurant && activeRestaurant.length === 24) {
      fetchMenu();
    }
  }, [activeRestaurant]);

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
          const currentActive = data.orders.find(
            (o) => o.status !== "Delivered" && o.status !== "Cancelled"
          );
          if (currentActive) {
            setActiveOrder(currentActive);
            setOrderId(currentActive._id);
          } else {
            setActiveOrder(data.orders[0]);
            setOrderId(data.orders[0]._id);
          }
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
  useEffect(() => {
    if (!user) return;

    const handleIncomingStatus = (status, msg) => {
      const sKey = getNormalizedStatus(status);
      setActiveOrder((prev) => {
        const updated = { ...(prev || {}), status: sKey };
        localStorage.setItem("active_canteen_order", JSON.stringify(updated));
        return updated;
      });

      if (sKey === "ready") {
        showToast(msg || "🍱 Order Ready! Your food is cooked & packed at the canteen.", "success");
      } else if (sKey === "on_the_way") {
        showToast(msg || "🛵 Rider On The Way! Rider has picked up your food.", "info");
      } else if (sKey === "arrived") {
        showToast(msg || "📍 Rider Arrived! Rider has reached your location. Please receive your food.", "info");
      } else if (sKey === "completed") {
        showToast(msg || "✅ Order Delivered! Enjoy your meal.", "success");
      }
    };

    // 1. Socket.io
    const socket = io(SOCKET_URL);
    socket.on("connect", () => {
      socket.emit("join_user_room", user._id);
    });

    socket.on("order_status_update", (data) => {
      handleIncomingStatus(data.status, data.message);
    });

    socket.on("order_arrived", (data) => {
      handleIncomingStatus("arrived", data.message);
    });

    socket.on("order_delivered", (data) => {
      handleIncomingStatus("completed", data.message);
    });

    // 2. BroadcastChannel for Instant Cross-Tab Communication
    let channel;
    try {
      channel = new BroadcastChannel("campus_connect_orders");
      channel.onmessage = (event) => {
        if (event.data && event.data.status) {
          handleIncomingStatus(event.data.status, event.data.message);
        }
      };
    } catch (e) {}

    // 3. Storage event for cross-tab local storage changes
    const handleStorageChange = (e) => {
      if (e.key === "active_canteen_order" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.status) {
            handleIncomingStatus(parsed.status);
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      socket.disconnect();
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, showToast]);

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

  // ── Cart Helpers ──────────────────────────────────────────────────
  const handleAddToCart = (item) => {
    const itemId = item._id || item.id;
    setCart((prev) => {
      const ex = prev.find((ci) => ci.id === itemId);
      if (ex) return prev.map((ci) => ci.id === itemId ? { ...ci, qty: ci.qty + 1 } : ci);
      return [...prev, { ...item, id: itemId, qty: 1 }];
    });
  };

  const handleAddToCartClick = (item) => {
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
    if (cart.length === 0) return;
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
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

      if (data.success) {
        setActiveOrder(data.order);
        setOrderId(data.order._id);
        setCart([]);
        setIsTrackingOpen(true);
        handleRemovePromo();
        showToast("Order placed successfully! 🛵 Delivery/pickup tracking is now active.", "success");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      showToast(err.response?.data?.message || "Failed to place order. Please try again.", "error");
    }
  };

  // ── Reviews ───────────────────────────────────────────────────────
  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    const canteenName = restaurantsList[selectedVisualIndex]?.name || "Cafe Aroma";
    setReviews([
      {
        name: newReviewName || "Anonymous Student",
        canteenName: canteenName,
        rating: newReviewRating,
        comment: newReviewComment,
        date: new Date().toISOString().split("T")[0],
      },
      ...reviews,
    ]);
    setNewReviewComment("");
    setNewReviewRating(5);
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
    if (s === "pending" || s === "preparing" || s === "placed" || s === "new") return "preparing";
    if (s === "ready" || s === "dispatched" || s === "food_ready" || s === "order_ready") return "ready";
    if (s === "on_the_way" || s === "on-the-way" || s === "in_transit" || s === "on the way" || s === "accepted") return "on_the_way";
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



  if (!user) return null;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#faf8f5] font-sans text-slate-800">
      <div className="flex flex-1 min-w-0 w-full animate-fade-in">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <Topbar
            time={time}
            user={user}
            setUser={setUser}
            avatar={getPersonalizedAvatar(avatar)}
            handleAvatarChange={handleAvatarChange}
            isUploading={isUploading}
          />

          <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">

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

            {/* ── RESTAURANT CAROUSEL (Browse tab only) ── */}
            {activeTab === "browse" && (
              <RestaurantList
                restaurants={restaurantsList}
                activeRestaurant={activeRestaurant}
                setActiveRestaurant={setActiveRestaurant}
                setSelectedCategory={setSelectedCategory}
                selectedVisualIndex={selectedVisualIndex}
                setSelectedVisualIndex={setSelectedVisualIndex}
              />
            )}

            {/* ── MAIN CONTENT GRID ── */}
            <div className="grid grid-cols-[1fr_330px] gap-8 max-[1100px]:grid-cols-1">

              {/* LEFT: tab-gated content */}
              <div className="flex flex-col gap-8">

                {activeTab === "browse" && (
                  <MenuBoard
                    popularDishes={POPULAR_DISHES}
                    restaurants={restaurantsList}
                    activeRestaurant={activeRestaurant}
                    filteredMenu={filteredMenu}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={CATEGORIES}
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
                )}

                {activeTab === "deals" && (
                  <div className="flex flex-col gap-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-[#0a2342] to-[#1a3a6b] p-7 flex flex-col gap-3">
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#fbbf24] bg-[#fbbf24]/10 px-3 py-1 rounded-full w-fit">
                        🏷️ Exclusive Deals
                      </span>
                      <h2 className="text-[22px] font-black text-white leading-tight">
                        Save Big on Campus Eats!
                      </h2>
                      <p className="text-[12.5px] text-slate-300 font-medium">
                        Use promo codes at checkout to unlock special student discounts.
                      </p>
                    </div>

                    <h3 className="text-[14px] font-extrabold text-[#0a2342] uppercase tracking-wide">
                      Active Promo Codes
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { code: "WELCOME50", desc: "Rs. 50 flat off on orders above Rs. 300", color: "from-[#e2725b]/10 to-[#e2725b]/5", border: "border-[#e2725b]/20", text: "text-[#e2725b]" },
                        { code: "FREEPASS", desc: "Free delivery on orders above Rs. 200", color: "from-blue-50 to-indigo-50", border: "border-blue-100", text: "text-blue-700" },
                        { code: "STUDENT15", desc: "15% off (max Rs. 150) on orders above Rs. 250", color: "from-orange-50 to-red-50", border: "border-orange-100", text: "text-orange-700" },
                      ].map(({ code, desc, color, border, text }) => (
                        <div
                          key={code}
                          className={`bg-gradient-to-br ${color} border ${border} rounded-2xl p-4 flex flex-col gap-2`}
                        >
                          <div className="flex justify-between items-start">
                            <span className={`text-[13px] font-black tracking-wider ${text}`}>{code}</span>
                            <button
                              onClick={() => setPromoCode(code)}
                              className={`text-[9.5px] font-extrabold uppercase tracking-wide bg-white border ${border} px-2 py-0.5 rounded-lg cursor-pointer hover:shadow-sm transition-all`}
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-[10.5px] text-slate-500 font-medium">{desc}</p>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-[14px] font-extrabold text-[#0a2342] uppercase tracking-wide mt-2">
                      Today's Featured Deals
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {DEALS.map((deal) => (
                        <div
                          key={deal.id}
                          className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                        >
                          <div className="relative h-[130px] overflow-hidden">
                            <img
                              src={deal.image}
                              alt={deal.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute top-3 left-3 bg-[#ef4444] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase shadow">
                              {deal.tag}
                            </span>
                          </div>
                          <div className="p-4 flex flex-col gap-2">
                            <h4 className="text-[13px] font-black text-[#0a2342]">{deal.title}</h4>
                            <p className="text-[10.5px] text-slate-400 font-medium">{deal.desc}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[14px] font-black text-[#e2725b]">Rs. {deal.price}</span>
                              <button
                                onClick={() => {
                                  let targetResId = activeRestaurant;
                                  let visualIdx = selectedVisualIndex;
                                  if (restaurantsList && restaurantsList.length > 0) {
                                    if (deal.restaurantId === "sav") { targetResId = restaurantsList[0]?._id; visualIdx = 0; }
                                    else if (deal.restaurantId === "gour") { targetResId = restaurantsList[1 % restaurantsList.length]?._id; visualIdx = 1; }
                                    else if (deal.restaurantId === "jj") { targetResId = restaurantsList[2 % restaurantsList.length]?._id; visualIdx = 2; }
                                    else if (deal.restaurantId === "dog") { targetResId = restaurantsList[3 % restaurantsList.length]?._id; visualIdx = 3; }
                                  }
                                  setActiveRestaurant(targetResId);
                                  setSelectedVisualIndex(visualIdx);
                                  handleAddToCartClick({
                                    id: deal.id,
                                    name: deal.title,
                                    price: deal.price,
                                    category: deal.category,
                                    desc: deal.desc,
                                    image: deal.image
                                  });
                                  setActiveTab("browse");
                                }}
                                className="bg-[#0a2342] hover:bg-[#e2725b] text-white border-none py-1.5 px-4 rounded-xl text-[11px] font-bold cursor-pointer transition-colors shadow-sm focus:outline-none"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "track" && (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="relative rounded-3xl overflow-hidden shadow-lg bg-gradient-to-r from-[#0a2342] via-[#0f2e54] to-[#0a2342] p-6 flex flex-col gap-3 text-white border border-[#00c2cb]/30">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#00c2cb] bg-[#00c2cb]/15 px-3 py-1 rounded-full border border-[#00c2cb]/30">
                          🛵 Live Active Order Tracking
                        </span>
                        {activeOrder && (
                          <span className="text-xs font-black text-[#00c2cb]">
                            #{activeOrder._id ? String(activeOrder._id).slice(-6).toUpperCase() : "LIVE"}
                          </span>
                        )}
                      </div>

                      <h2 className="text-[20px] font-black text-white leading-tight">
                        {activeOrder ? (activeOrder.canteenName || activeOrder.restaurantName || "Campus Canteen") : "Canteen Active Order"}
                      </h2>
                      <p className="text-[12px] text-slate-300 font-medium">
                        Real-time status updates: Kitchen Preparation → Food Ready → Rider Picked Up → Arrival at Location
                      </p>
                    </div>

                    {activeOrder ? (
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                        {/* Order Info Header */}
                        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-100">
                          <div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase">Canteen Vendor</div>
                            <div className="text-base font-black text-[#0a2342]">
                              {activeOrder.canteenName || activeOrder.restaurantName || "Cafe Aroma"}
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
                              { id: "preparing", label: "Preparing", icon: "🍳" },
                              { id: "ready", label: "Order Ready", icon: "🍱" },
                              { id: "on_the_way", label: "Rider On Way", icon: "🛵" },
                              { id: "arrived", label: "Rider at Location", icon: "📍" },
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
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold transition-all duration-300 ${
                                      isActive
                                        ? "bg-[#00c2cb] text-[#0a2342] scale-110 shadow-[0_0_15px_rgba(0,194,203,0.5)] ring-4 ring-[#00c2cb]/20"
                                        : isPassed
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-200 text-slate-400"
                                    }`}
                                  >
                                    {isPassed ? "✓" : step.icon}
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold mt-2 ${
                                      isActive ? "text-[#00c2cb] font-black" : isPassed ? "text-emerald-600" : "text-slate-400"
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
                          <div className="text-3xl animate-bounce">
                            {getNormalizedStatus(activeOrder.status) === "preparing" && "🍳"}
                            {getNormalizedStatus(activeOrder.status) === "ready" && "🍱"}
                            {getNormalizedStatus(activeOrder.status) === "on_the_way" && "🛵"}
                            {getNormalizedStatus(activeOrder.status) === "arrived" && "📍"}
                            {getNormalizedStatus(activeOrder.status) === "completed" && "✅"}
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
                              {getNormalizedStatus(activeOrder.status) === "on_the_way" && "Rider order le kar aap ki location ki taraf aa raha hai! 🛵"}
                              {getNormalizedStatus(activeOrder.status) === "arrived" && "Rider aap ki location par pohnch gaya hai! 📍 Kripya food receive karein."}
                              {getNormalizedStatus(activeOrder.status) === "completed" && "Order has been delivered successfully. Enjoy your meal!"}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Status Switcher (Test Toolbar) */}
                        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[10px] font-black text-slate-400 uppercase">
                            ⚡ Test Status Updates (Simulator):
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: "preparing", label: "🍳 Preparing" },
                              { id: "ready", label: "🍱 Order Ready" },
                              { id: "on_the_way", label: "🛵 Rider On Way" },
                              { id: "arrived", label: "📍 Rider at Location" },
                              { id: "completed", label: "✅ Delivered" },
                            ].map(st => (
                              <button
                                key={st.id}
                                onClick={() => {
                                  setActiveOrder(prev => (prev ? { ...prev, status: st.id } : prev));
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer border transition-all ${
                                  getNormalizedStatus(activeOrder.status) === st.id
                                    ? "bg-[#00c2cb] text-[#0a2342] border-[#00c2cb]"
                                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
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
                            💬 Contact via WhatsApp
                          </a>

                          <button
                            onClick={() => setIsTrackingOpen(true)}
                            className="bg-[#00c2cb] hover:bg-[#00a3ab] text-[#0a2342] border-none px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all duration-200 shadow-md hover:scale-105"
                          >
                            Open Full Modal Tracker →
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center gap-3 shadow-sm">
                        <span className="text-4xl">🛵</span>
                        <h3 className="text-base font-black text-[#0a2342]">No Active Order Currently</h3>
                        <p className="text-xs text-slate-500 font-semibold max-w-sm m-0">
                          You don't have an active canteen order right now. Place an order from the Browse Menu tab or click below to generate a test order!
                        </p>
                        <button
                          onClick={() => {
                            const demo = {
                              _id: "ORD-9842",
                              restaurantName: "Cafe Aroma",
                              canteenName: "Cafe Aroma",
                              items: [{ name: "Special Zinger Burger", quantity: 2, price: 350 }],
                              totalAmount: 700,
                              status: "preparing",
                              createdAt: new Date().toISOString()
                            };
                            setActiveOrder(demo);
                            setOrderId(demo._id);
                          }}
                          className="mt-2 bg-[#0a2342] text-white hover:bg-[#00c2cb] hover:text-[#0a2342] border-none px-5 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all shadow-md"
                        >
                          + Generate Demo Active Order
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT: Cart + Sidebar details (always visible) */}
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
              />
            </div>

            {/* ── COMMUNITY REVIEWS SECTION ── */}
            {activeTab === "browse" && (
              <CanteenReview
                reviews={reviews}
                newReviewName={newReviewName}
                newReviewComment={newReviewComment}
                setNewReviewComment={setNewReviewComment}
                newReviewRating={newReviewRating}
                setNewReviewRating={setNewReviewRating}
                handlePostReview={handlePostReview}
              />
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
        restaurantPhone={restaurantsList.find(r => r._id === activeRestaurant || r.owner === activeRestaurant || r._id === activeOrder?.restaurant)?.phone || "+923001234567"}
        restaurantName={restaurantsList.find(r => r._id === activeRestaurant || r.owner === activeRestaurant || r._id === activeOrder?.restaurant)?.name || "Campus Bites"}
      />

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
