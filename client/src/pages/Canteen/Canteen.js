import React, { useState, useEffect } from "react";
// Updated Canteen UI
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

const CATEGORIES = [
  { name: "All", icon: "🍽️", bgColor: "bg-[#00c2cb]/10", textColor: "text-[#0079c2]" },
  { name: "Fast Food", icon: "🍔", bgColor: "bg-orange-50", textColor: "text-orange-500" },
  { name: "Traditional", icon: "🍛", bgColor: "bg-red-50", textColor: "text-red-500" },
  { name: "Beverages", icon: "🥤", bgColor: "bg-blue-50", textColor: "text-blue-500" },
  { name: "Desserts", icon: "🍰", bgColor: "bg-pink-50", textColor: "text-pink-500" },
];

const DEFAULT_CANTEENS = [
  { _id: "sav", id: "sav", name: "Savour Foods", coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80", isActive: true },
  { _id: "gour", id: "gour", name: "Gourmet Restaurant", coverImage: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80", isActive: true },
  { _id: "jj", id: "jj", name: "Johnny & Jugnu", coverImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80", isActive: true },
  { _id: "dog", id: "dog", name: "Dogar Restaurant", coverImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80", isActive: true },
  { _id: "aroma", id: "aroma", name: "Cafe Aroma (Library)", coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80", isActive: true },
  { _id: "spice", id: "spice", name: "Spice Junction (CS Block)", coverImage: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&q=80", isActive: true },
  { _id: "hub", id: "hub", name: "Student Food Hub", coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", isActive: true },
  { _id: "scoop", id: "scoop", name: "Sweet & Scoop Cafe", coverImage: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80", isActive: true },
  { _id: "howdy", id: "howdy", name: "Howdy Burgers", coverImage: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80", isActive: true },
  { _id: "kfc", id: "kfc", name: "KFC Express (Campus)", coverImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80", isActive: true },
  { _id: "cheez", id: "cheez", name: "Cheezious Pizza", coverImage: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80", isActive: true },
  { _id: "tez", id: "tez", name: "Tezgaah Chai & Snacks", coverImage: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80", isActive: true },
  { _id: "sub", id: "sub", name: "Subway Campus Corner", coverImage: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80", isActive: true },
  { _id: "bbq", id: "bbq", name: "Bar B Q Tonight Grill", coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80", isActive: true },
];

const getFallbackMenuForRestaurant = (resId) => {
  const sId = String(resId).toLowerCase();
  if (sId.includes("howdy")) {
    return [
      { _id: "hw1", name: "Double Charcoal Burger", price: 420, category: "Fast Food", description: "Juicy double beef patty with smoked BBQ sauce & cheese.", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80" },
      { _id: "hw2", name: "Curly Fries Platter", price: 210, category: "Fast Food", description: "Seasoned crispy spiral curly fries with garlic mayo dip.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80" },
      { _id: "hw3", name: "Smokey Chicken Fillet", price: 380, category: "Fast Food", description: "Flame grilled chicken breast with cheddar slice.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80" },
    ];
  } else if (sId.includes("kfc")) {
    return [
      { _id: "kf1", name: "Mighty Zinger Burger", price: 490, category: "Fast Food", description: "Double crispy zinger chicken fillet with cheese & mayo.", image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80" },
      { _id: "kf2", name: "Hot Wings 6pcs", price: 340, category: "Fast Food", description: "Signature spicy fried chicken wings.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80" },
      { _id: "kf3", name: "Krunch Burger Deal", price: 270, category: "Fast Food", description: "Krunch burger with fries & 345ml cold drink.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
    ];
  } else if (sId.includes("cheez")) {
    return [
      { _id: "cz1", name: "Crown Crust Chicken Tikka Pizza", price: 650, category: "Fast Food", description: "Loaded cheese crown crust with spicy tikka chunks.", image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80" },
      { _id: "cz2", name: "Fettuccine Alfredo Pasta", price: 480, category: "Fast Food", description: "Rich creamy parmesan pasta with grilled chicken.", image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281270?w=500&q=80" },
      { _id: "cz3", name: "Oven Baked Calzone", price: 390, category: "Fast Food", description: "Folded pizza pocket stuffed with mozzarella & chicken.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
    ];
  } else if (sId.includes("tez")) {
    return [
      { _id: "tz1", name: "Special Matka Chai", price: 110, category: "Beverages", description: "Clay pot brewed aromatic cardamom tea.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80" },
      { _id: "tz2", name: "Chicken Cheese Paratha", price: 210, category: "Traditional", description: "Crispy tawa paratha stuffed with spicy chicken & cheese.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80" },
      { _id: "tz3", name: "Samosa Chaat Bowl", price: 140, category: "Traditional", description: "Crushed samosas topped with chana curry & sweet chutney.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80" },
    ];
  } else if (sId.includes("sub")) {
    return [
      { _id: "sb1", name: "Chicken Teriyaki 6-inch Sub", price: 410, category: "Fast Food", description: "Fresh parmesan oregano bread with teriyaki chicken & veggies.", image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80" },
      { _id: "sb2", name: "Italian B.M.T. Footlong", price: 680, category: "Fast Food", description: "12-inch sub packed with pepperoni, salami & ham.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80" },
      { _id: "sb3", name: "Double Chocolate Cookie", price: 120, category: "Desserts", description: "Freshly baked soft & chewy chocolate chip cookie.", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80" },
    ];
  } else if (sId.includes("bbq")) {
    return [
      { _id: "bq1", name: "Chicken Seekh Kabab (4pcs)", price: 380, category: "Traditional", description: "Flame charcoal grilled minced chicken kababs with mint chutney.", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80" },
      { _id: "bq2", name: "Chicken Boti Platter", price: 440, category: "Traditional", description: "Smokey charcoal tikka boti served with fresh naan.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80" },
      { _id: "bq3", name: "Garlic Butter Naan", price: 50, category: "Traditional", description: "Tandoori naan brushed with crushed garlic & melted butter.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80" },
    ];
  } else if (sId.includes("aroma")) {
    return [
      { _id: "ar1", name: "Cappuccino Coffee", price: 240, category: "Beverages", description: "Rich brewed espresso with frothed steamed milk.", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&q=80" },
      { _id: "ar2", name: "Grilled Chicken Sandwich", price: 260, category: "Fast Food", description: "Toasted brown bread filled with chicken slice and cheese.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80" },
      { _id: "ar3", name: "Blueberry Muffin", price: 120, category: "Desserts", description: "Freshly baked warm blueberry muffin.", image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80" },
      { _id: "ar4", name: "Chilled Iced Tea", price: 130, category: "Beverages", description: "Refreshing lemon iced tea with mint leaves.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80" },
    ];
  } else if (sId.includes("spice")) {
    return [
      { _id: "sp1", name: "Zinger Chicken Paratha Roll", price: 220, category: "Fast Food", description: "Crispy zinger wrapped in golden paratha with garlic mayo.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80" },
      { _id: "sp2", name: "Crispy Nuggets 6pcs", price: 240, category: "Fast Food", description: "Golden fried tender chicken nuggets with dip sauce.", image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80" },
      { _id: "sp3", name: "Special Masala Fries", price: 130, category: "Fast Food", description: "Spicy seasoned potato fries served piping hot.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80" },
      { _id: "sp4", name: "Chilled Sprite 345ml", price: 90, category: "Beverages", description: "Cold fizzy drink.", image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500&q=80" },
    ];
  } else if (sId.includes("hub")) {
    return [
      { _id: "hb1", name: "Chicken Karahi (Single)", price: 350, category: "Traditional", description: "Desi wok cooked spicy chicken karahi served with naan.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80" },
      { _id: "hb2", name: "Special Daal Fry", price: 160, category: "Traditional", description: "Yellow lentils cooked in ghee tarka.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80" },
      { _id: "hb3", name: "Roghni Naan", price: 40, category: "Traditional", description: "Fresh tandoori naan brushed with sesame & butter.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&q=80" },
      { _id: "hb4", name: "Anda Shami Burger", price: 150, category: "Fast Food", description: "Classic Lahori bun kabab with egg and chutney.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80" },
    ];
  } else if (sId.includes("scoop")) {
    return [
      { _id: "sc1", name: "Belgian Chocolate Ice Cream (2 Scoop)", price: 220, category: "Desserts", description: "Rich Belgian dark chocolate ice cream.", image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500&q=80" },
      { _id: "sc2", name: "Oreo Milkshake", price: 220, category: "Beverages", description: "Creamy milkshake blended with Oreo cookies.", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80" },
      { _id: "sc3", name: "Sizzling Brownie with Ice Cream", price: 280, category: "Desserts", description: "Hot chocolate brownie topped with vanilla scoop.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80" },
      { _id: "sc4", name: "Mango Thick Shake", price: 190, category: "Beverages", description: "Fresh Alphonso mango pulp smoothie.", image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500&q=80" },
    ];
  } else if (sId.includes("gour")) {
    return [
      { _id: "g1", name: "Gourmet Club Sandwich", price: 280, category: "Fast Food", description: "Double decker sandwich with chicken, egg, mayo, and lettuce.", image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80" },
      { _id: "g2", name: "Chicken Patties", price: 110, category: "Fast Food", description: "Puff pastry stuffed with seasoned chicken.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80" },
      { _id: "g3", name: "Chocolate Fudge Pastry", price: 140, category: "Desserts", description: "Rich chocolate layer cake slice.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80" },
      { _id: "g4", name: "Zinger Burger", price: 340, category: "Fast Food", description: "Crispy chicken breast with cheese & sauce.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80" },
    ];
  } else if (sId.includes("jj")) {
    return [
      { _id: "jj1", name: "Wehshi Burger", price: 390, category: "Fast Food", description: "Famous crispy chicken fillet burger with Wehshi hot sauce.", image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80" },
      { _id: "jj2", name: "Crispy Chicken Wrap", price: 350, category: "Fast Food", description: "Tortilla wrap filled with crispy strips and sauces.", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80" },
      { _id: "jj3", name: "Loaded Cheese Fries", price: 250, category: "Fast Food", description: "Fries topped with melted cheese & jalapenos.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80" },
    ];
  } else if (sId.includes("dog")) {
    return [
      { _id: "d1", name: "Special Chicken Biryani", price: 320, category: "Traditional", description: "Lahori-style spicy chicken biryani with boiled egg and raita.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80" },
      { _id: "d2", name: "Special Doodh Patti Chai", price: 90, category: "Beverages", description: "Strong cardamom cooked milk tea.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80" },
      { _id: "d3", name: "Chicken Karahi Portion", price: 450, category: "Traditional", description: "Spicy Lahori karahi with naan.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80" },
    ];
  } else {
    return [
      { _id: "sav1", name: "Chicken Pulao Kabab", price: 380, category: "Traditional", description: "Savour's legendary fragrant basmati rice served with two shami kababs.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80" },
      { _id: "sav2", name: "Zarda Sweet Rice", price: 150, category: "Desserts", description: "Traditional sweet saffron rice with nuts.", image: "https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=500&q=80" },
      { _id: "sav3", name: "Extra Shami Kabab", price: 90, category: "Traditional", description: "Tender beef shami kabab.", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80" },
      { _id: "sav4", name: "Zeera Raita", price: 40, category: "Traditional", description: "Chilled cumin yogurt raita.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80" },
    ];
  }
};

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
  useEffect(() => {
    const fetchRestaurants = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        setIsLoadingRestaurants(true);
        const { data } = await axios.get("/api/canteen/restaurants", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(err => ({ data: { success: true, restaurants: [] } }));

        let mergedList = DEFAULT_CANTEENS;
        if (data && data.success && data.restaurants && data.restaurants.length > 0) {
          const nameSet = new Set();
          const uniqueList = [];

          // Add API restaurants first
          data.restaurants.forEach(r => {
            const normName = (r.name || "").toLowerCase().trim();
            if (normName && !nameSet.has(normName)) {
              nameSet.add(normName);
              uniqueList.push(r);
            }
          });

          // Add default canteens if not already present by name
          DEFAULT_CANTEENS.forEach(r => {
            const normName = (r.name || "").toLowerCase().trim();
            if (normName && !nameSet.has(normName)) {
              nameSet.add(normName);
              uniqueList.push(r);
            }
          });
          mergedList = uniqueList;
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

        if (foundIndex !== -1) {
          setActiveRestaurant(mergedList[foundIndex]._id || mergedList[foundIndex].id);
          setSelectedVisualIndex(foundIndex);
        }
      } catch (err) {
        setRestaurantsList(DEFAULT_CANTEENS);
      } finally {
        setIsLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, [location.state]);

  // ── Fetch Restaurant Menu ────────────────────────────────────────
  useEffect(() => {
    const fetchMenu = async () => {
      const token = sessionStorage.getItem("token");
      if (!token || !activeRestaurant) return;
      try {
        setIsLoadingMenu(true);
        const { data } = await axios.get(`/api/canteen/restaurants/${activeRestaurant}/menu`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: { success: false } }));

        if (data && data.success && data.menu && data.menu.length > 0) {
          setMenuList(data.menu);
        } else {
          setMenuList(getFallbackMenuForRestaurant(activeRestaurant));
        }
      } catch (err) {
        setMenuList(getFallbackMenuForRestaurant(activeRestaurant));
      } finally {
        setIsLoadingMenu(false);
      }
    };

    if (activeRestaurant) {
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
  const lastToastStatusRef = React.useRef({ status: "", time: 0 });

  useEffect(() => {
    if (!user) return;

    const handleIncomingStatus = (status, msg) => {
      if (!status) return;
      const sKey = getNormalizedStatus(status);

      // Prevent duplicate toast popups within 3 seconds for same status key
      const now = Date.now();
      const isDuplicate = lastToastStatusRef.current.status === sKey && (now - lastToastStatusRef.current.time < 3000);
      if (!isDuplicate) {
        lastToastStatusRef.current = { status: sKey, time: now };

        if (sKey === "ready") {
          showToast(msg || "🍱 Order Ready! Your food is cooked & packed at the canteen.", "success");
        } else if (sKey === "on_the_way" || sKey === "accepted") {
          showToast(msg || "🛵 Rider On The Way! Rider has picked up your food.", "info");
        } else if (sKey === "arrived") {
          showToast(msg || "📍 Rider Arrived! Rider has reached your location. Please receive your food.", "info");
        } else if (sKey === "completed" || sKey === "delivered") {
          showToast(msg || "✅ Order Delivered! Enjoy your meal.", "success");
        }
      }

      setActiveOrder((prev) => {
        if (prev && prev.status === sKey) return prev;
        const updated = { ...(prev || {}), status: sKey };
        localStorage.setItem("active_canteen_order", JSON.stringify(updated));
        return updated;
      });
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

    if (token) {
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

        if (data && data.success && data.order) {
          setActiveOrder(data.order);
          setOrderId(data.order.orderId || data.order._id);
        } else {
          setActiveOrder(newOrderObj);
          setOrderId(newOrderObj._id);
        }
      } catch (err) {
        console.error("Error creating order:", err);
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
    showToast("Order placed successfully! 🛵 Delivery tracking is now live.", "success");
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

  const activeResObj = restaurantsList.find(
    (r) => (r._id || r.id) === activeRestaurant || r.owner === activeRestaurant || (activeOrder && (r._id === activeOrder.restaurant || r.name === activeOrder.restaurantName))
  );
  const currentResPhone = activeResObj?.phone || "+923001234567";
  const currentResName = activeResObj?.name || activeOrder?.restaurantName || activeOrder?.canteenName || "Campus Canteen";

  if (!user) return null;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8f5] font-sans text-slate-800">
      <div className="flex flex-1 min-w-0 w-full h-full animate-fade-in overflow-hidden">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
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
                          src={activeResObj?.coverImage || activeResObj?.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80"}
                          alt={activeResObj?.name || "Selected Restaurant"}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-emerald-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase shadow-xs">
                          Open
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 sm:gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className="text-[9px] sm:text-[10px] uppercase font-black text-[#F5B82E] bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full tracking-wider">
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
                          <div className="flex items-center gap-1 bg-white/10 text-[#F5B82E] px-2 py-0.5 rounded-lg border border-white/10 font-black text-[10px] sm:text-[11px]">
                            <span className="text-amber-400">★</span>
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
                        className="w-full md:w-auto flex items-center justify-center gap-2 text-xs font-black text-[#071A35] hover:bg-[#FFD05B] bg-[#F5B82E] px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer border-none shadow-md group"
                      >
                        <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
                        <span>Select Another Canteen</span>
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Grid: Menu Board + Checkout Cart (Stacks cleanly under 1200px to avoid overflow) */}
                  <div className="grid grid-cols-1 min-[1200px]:grid-cols-[1fr_320px] gap-6 items-start w-full min-w-0">
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
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6">
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
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold transition-all duration-300 ${isActive
                                      ? "bg-[#00c2cb] text-[#0a2342] scale-110 shadow-[0_0_15px_rgba(0,194,203,0.5)] ring-4 ring-[#00c2cb]/20"
                                      : isPassed
                                        ? "bg-emerald-500 text-white"
                                        : "bg-slate-200 text-slate-400"
                                      }`}
                                  >
                                    {isPassed ? "✓" : step.icon}
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
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer border transition-all ${getNormalizedStatus(activeOrder.status) === st.id
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
                      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-center flex flex-col items-center gap-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <span className="text-4xl">🛵</span>
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
      />

      {/* ── TOAST NOTIFICATION (Ultra Compact) ── */}
      {toast && (
        <div className={`fixed top-14 sm:top-18 right-3 sm:right-6 max-w-[270px] sm:max-w-[300px] bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl px-3 py-2 shadow-xl z-[3000] flex items-center gap-2 animate-modal-slide-in ${toast.type === 'warning' ? 'border-l-3 border-l-amber-500' : toast.type === 'error' ? 'border-l-3 border-l-red-500' : toast.type === 'success' ? 'border-l-3 border-l-emerald-500' : 'border-l-3 border-l-[#00c2cb]'}`}>
          <div className="text-xs shrink-0">
            {toast.type === 'warning' && <span>⚠️</span>}
            {toast.type === 'error' && <span>❌</span>}
            {toast.type === 'success' && <span>✅</span>}
            {toast.type === 'info' && <span>ℹ️</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-bold text-[#0a2342] leading-tight truncate">{toast.message}</p>
          </div>
          <button className="text-xs font-black text-slate-400 hover:text-slate-700 cursor-pointer border-none bg-none p-0.5 shrink-0 leading-none" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}
