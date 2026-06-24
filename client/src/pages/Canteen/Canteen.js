import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

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
import gourmetImg from "../../assets/gourmet.png";
import savourImg from "../../assets/savour.png";

// ─── DATA ────────────────────────────────────────────────────────────────────

const POPULAR_DISHES = [
  { id: "by1", name: "Chicken Biryani", price: 280, rating: 4.7, reviews: 120, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80", category: "Traditional", desc: "Spicy and flavorful basmati rice layered with tender chicken.", restaurantId: "biryani" },
  { id: "g2", name: "Zinger Burger", price: 250, rating: 4.6, reviews: 98, image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80", category: "Fast Food", desc: "Golden fried crispy chicken fillet topped with spicy mayo and lettuce.", restaurantId: "gourmet" },
  { id: "g1", name: "Club Sandwich", price: 220, rating: 4.5, reviews: 76, image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80", category: "Fast Food", desc: "Classic double-decker sandwich with grilled chicken, egg, and fresh veggies.", restaurantId: "gourmet" },
  { id: "g3", name: "French Fries", price: 150, rating: 4.4, reviews: 64, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80", category: "Fast Food", desc: "Crispy french fries drenched in rich cheese sauce.", restaurantId: "gourmet" },
  { id: "g4", name: "Cold Coffee", price: 180, rating: 4.6, reviews: 52, image: "https://images.unsplash.com/photo-1571934811356-5cc561b63d2c?w=500&q=80", category: "Beverages", desc: "Rich espresso blend topped with creamy frothed milk foam.", restaurantId: "gourmet" },
];

const DEALS = [
  { id: "d1", tag: "20% OFF", title: "Biryani Bonanza", desc: "Get 20% off on all biryani orders", price: 224, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80", category: "Traditional", name: "Biryani Bonanza Deal", restaurantId: "biryani" },
  { id: "d2", tag: "COMBO DEAL", title: "Burger + Fries + Drink", desc: "Awesome combo at just Rs. 299 only", price: 299, image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80", category: "Fast Food", name: "Burger Combo Deal", restaurantId: "gourmet" },
  { id: "d3", tag: "15% OFF", title: "Weekend Special", desc: "Flat 15% off on all orders above Rs. 700", price: 799, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", category: "Fast Food", name: "Weekend Pizza Deal Platter", restaurantId: "tehzeeb" },
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
  { name: "Muhammad Bilal", rating: 5, comment: "Savour Pulao is always consistent. Fast service even during peak lunch hours!", date: "2026-05-29" },
  { name: "Zoya Sheikh", rating: 4, comment: "Gourmet Café has the best club sandwiches on campus. A bit pricey but worth it.", date: "2026-05-28" },
  { name: "Usama Syed", rating: 3, comment: "Bundu Khan Boti is delicious, but sometimes they take over 25 minutes to prepare.", date: "2026-05-27" },
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
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

  // ── WebSocket Real-Time Tracking ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      socket.emit("join_user_room", user._id);
    });

    socket.on("order_status_update", (data) => {
      setActiveOrder((prev) => {
        if (prev && prev._id === data.orderId) {
          return { ...prev, status: data.status };
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

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
        alert("Order placed successfully!");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  // ── Reviews ───────────────────────────────────────────────────────
  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setReviews([{ name: newReviewName || "Anonymous Student", rating: newReviewRating, comment: newReviewComment, date: new Date().toISOString().split("T")[0] }, ...reviews]);
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
    if (nameLower.match(/(pastry|cake|brownie|dessert|sweet|ice cream)/) || descLower.match(/(pastry|cake|brownie|dessert|sweet|ice cream)/)) return "Desserts";
    return "Fast Food";
  };

  // ── Filtered Menu ─────────────────────────────────────────────────
  const filteredMenu = menuList.filter((item) => {
    const itemCat = getItemCategory(item);
    const matchCat = selectedCategory === "All" || itemCat === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getTrackingStep = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Preparing":
        return 2;
      case "Dispatched":
        return 3;
      case "Delivered":
        return 4;
      case "Cancelled":
        return 0;
      default:
        return 1;
    }
  };

  const trackingStep = getTrackingStep(activeOrder?.status || "Pending");

  if (!user) return null;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-[#faf8f5] font-sans text-slate-800 animate-fade-in">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Topbar
          time={time}
          user={user}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={handleAvatarChange}
          isUploading={isUploading}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">

          {/* ── HERO / HEADER / TABS ── */}
          <CanteenHero
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
            />
          )}

          {/* ── MAIN CONTENT GRID ── */}
          <div className="grid grid-cols-[1fr_330px] gap-6 max-[1100px]:grid-cols-1">

            {/* LEFT: tab-gated content */}
            <div className="flex flex-col gap-6">

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
                                setActiveRestaurant(deal.restaurantId);
                                handleAddToCartClick({ id: deal.id, name: deal.title, price: deal.price, category: deal.category, desc: deal.desc, image: deal.image });
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
                <div className="flex flex-col gap-5">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-[14px] font-black text-[#0a2342] uppercase tracking-wide mb-1">
                      Live Order Tracking
                    </h3>
                    <p className="text-[11.5px] text-slate-400 font-medium mb-5">
                      Your order is being tracked in real time.
                    </p>

                    {/* Big Progress Bar */}
                    <div className="relative w-full h-3 bg-slate-100 rounded-full mb-8 overflow-visible">
                      <div
                        className="h-full bg-gradient-to-r from-[#e2725b] to-[#0a2342] rounded-full transition-all duration-700"
                        style={{ width: `${activeOrder?.status === "Cancelled" ? 100 : ((trackingStep - 1) / 3) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -ml-5 text-[28px] transition-all duration-700 select-none animate-bounce"
                        style={{ left: `${activeOrder?.status === "Cancelled" ? 50 : Math.max(0, ((trackingStep - 1) / 3) * 100)}%` }}
                      >
                        {activeOrder?.status === "Cancelled" ? "🛑" : "🛵"}
                      </div>
                    </div>

                    {/* Step Cards */}
                    <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
                      {[
                        { step: 1, icon: "📝", label: "Order Placed", color: "bg-[#e2725b]/10 text-[#e2725b]" },
                        { step: 2, icon: "👨‍🍳", label: "Preparing", color: "bg-orange-50 text-orange-500" },
                        { step: 3, icon: "🛵", label: "Out for Delivery", color: "bg-blue-50   text-blue-500" },
                        { step: 4, icon: "🎉", label: "Delivered", color: "bg-emerald-50 text-emerald-600" },
                      ].map(({ step, icon, label, color }) => (
                        <div
                          key={step}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${activeOrder?.status === "Cancelled" ? "opacity-30 border-slate-100" :
                              trackingStep >= step
                                ? "border-[#e2725b]/30 bg-[#e2725b]/5 shadow-sm"
                                : "border-slate-100 opacity-50"
                            }`}
                        >
                          <span className={`text-2xl w-11 h-11 rounded-full flex items-center justify-center ${color}`}>
                            {icon}
                          </span>
                          <span className="text-[11px] font-extrabold text-[#0a2342] text-center">{label}</span>
                          {activeOrder?.status !== "Cancelled" && trackingStep > step && (
                            <span className="text-emerald-600 text-[9px] font-extrabold">✓ Done</span>
                          )}
                          {activeOrder?.status !== "Cancelled" && trackingStep === step && (
                            <span className="text-[#e2725b] text-[9px] font-extrabold animate-pulse">● Live</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {activeOrder?.status === "Cancelled" && (
                      <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl text-center">
                        Order Cancelled: This order was cancelled by the vendor.
                      </div>
                    )}
                  </div>
                  {/* Rider Card */}
                  {activeOrder?.status !== "Cancelled" && (
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 flex justify-between items-center shadow-sm">
                      <div className="flex gap-3.5 items-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e2725b] to-[#0a2342] flex items-center justify-center font-black text-white text-[15px]">
                          AR
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-[#0a2342]">Ali Raza</h4>
                          <p className="text-[10.5px] text-slate-400 font-bold">Minhaj Delivery Express</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[#fbbf24] text-[11px]">★ ★ ★ ★ ★</span>
                            <span className="text-[10px] text-slate-400 font-semibold">5.0</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert("Mock call: Connecting with rider Ali Raza...")}
                        className="bg-[#e2725b] hover:bg-[#d55b41] text-white border-none py-2 px-5 rounded-xl text-[12px] font-bold cursor-pointer transition-all shadow-sm focus:outline-none"
                      >
                        📞 Call Rider
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
              reviews={reviews}
            />
          </div>

          {/* ── COMMUNITY REVIEWS SECTION ── */}
          <CanteenReview
            reviews={reviews}
            newReviewName={newReviewName}
            newReviewComment={newReviewComment}
            setNewReviewComment={setNewReviewComment}
            newReviewRating={newReviewRating}
            setNewReviewRating={setNewReviewRating}
            handlePostReview={handlePostReview}
          />

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
        trackingStep={trackingStep}
        orderId={orderId}
      />
    </div>
  );
}
