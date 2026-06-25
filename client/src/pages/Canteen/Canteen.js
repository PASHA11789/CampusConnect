import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

// Layout
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Canteen Subcomponents
import CanteenHero from "./components/CanteenHero";
import RestaurantList, { POPULAR_CANTEENS } from "./components/RestaurantList";
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

const getCanteenMenu = (visualIndex) => {
  switch (visualIndex) {
    case 0: // Savour Foods
      return [
        { _id: "sav1", name: "Chicken Pulao Kabab", price: 380, description: "Savour's legendary fragrant basmati rice served with two shami kababs and tender chicken piece.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80", category: "Traditional" },
        { _id: "sav2", name: "Shami Kabab Platter", price: 150, description: "Two pieces of crispy, golden-brown chicken shami kababs served with raita.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&q=80", category: "Traditional" },
        { _id: "sav3", name: "Savour Chicken Roll", price: 220, description: "Crispy fried wrap filled with shredded chicken, mayo, and green chutney.", image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80", category: "Fast Food" },
        { _id: "sav4", name: "Crispy Fries", price: 130, description: "Classic salted crispy potato fries with tomato ketchup.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80", category: "Fast Food" },
        { _id: "sav5", name: "Cold Drink (345ml)", price: 90, description: "Chilled carbonated soft drink of your choice.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80", category: "Beverages" },
        { _id: "sav6", name: "Fresh Lime Soda", price: 140, description: "Fizzy club soda with freshly squeezed lime juice and simple syrup.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", category: "Beverages" },
        { _id: "sav7", name: "Savour Special Kheer", price: 180, description: "Traditional slow-cooked rice pudding flavored with cardamom and garnished with almonds.", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=500&q=80", category: "Desserts" }
      ];
    case 1: // Gourmet Restaurant
      return [
        { _id: "gour1", name: "Gourmet Chicken Biryani", price: 300, description: "Aromatic basmati rice cooked with spicy chicken and traditional spices.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80", category: "Traditional" },
        { _id: "gour2", name: "Chicken Karahi (Single)", price: 420, description: "Traditional wok-cooked chicken with tomatoes, green chilies, and aromatic spices.", image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&q=80", category: "Traditional" },
        { _id: "gour3", name: "Club Sandwich", price: 280, description: "Gourmet's signature double-decker sandwich with chicken, egg, mayo, and lettuce.", image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=500&q=80", category: "Fast Food" },
        { _id: "gour4", name: "Gourmet Chicken Burger", price: 240, description: "Soft bun containing a chicken patty, signature sauce, and fresh vegetables.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80", category: "Fast Food" },
        { _id: "gour5", name: "Mango Shake", price: 220, description: "Thick, creamy blend of fresh sweet mangoes, milk, and vanilla ice cream.", image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&q=80", category: "Beverages" },
        { _id: "gour6", name: "Gourmet Mineral Water", price: 70, description: "Purified bottled drinking water.", image: "https://images.unsplash.com/photo-1608885898957-a599fb1b467a?w=500&q=80", category: "Beverages" },
        { _id: "gour7", name: "Gourmet Chocolate Pastry", price: 120, description: "Rich chocolate layer cake slice topped with fudge icing.", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80", category: "Desserts" },
        { _id: "gour8", name: "Pineapple Cake Slice", price: 110, description: "Soft sponge cake layer with whipped cream and pineapple bits.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80", category: "Desserts" }
      ];
    case 2: // Johnny & Jugnu
      return [
        { _id: "jj1", name: "Wehshi Burger", price: 390, description: "Johnny & Jugnu's famous crispy chicken fillet burger with Wehshi hot sauce.", image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&q=80", category: "Fast Food" },
        { _id: "jj2", name: "Mushroom Wrap", price: 350, description: "Tortilla wrap filled with crispy chicken strips, creamy mushroom sauce, and cheese.", image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80", category: "Fast Food" },
        { _id: "jj3", name: "Pizza Fries", price: 290, description: "Crispy fries loaded with marinara sauce, diced chicken, melted mozzarella, and olives.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&q=80", category: "Fast Food" },
        { _id: "jj4", name: "Chapli Kabab Burger", price: 260, description: "Fusion bun burger with a juicy, spiced beef chapli kabab patty.", image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500&q=80", category: "Traditional" },
        { _id: "jj5", name: "Mint Margarita", price: 180, description: "Refreshing blend of fresh mint leaves, lime juice, soda, and crushed ice.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80", category: "Beverages" },
        { _id: "jj6", name: "Soft Drink", price: 100, description: "Chilled canned soda.", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80", category: "Beverages" },
        { _id: "jj7", name: "Hot Fudge Brownie", price: 200, description: "Rich, dense chocolate brownie served warm with chocolate syrup.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80", category: "Desserts" },
        { _id: "jj8", name: "Nutella Waffle", price: 280, description: "Crispy waffle topped with generous Nutella spread and icing sugar.", image: "https://images.unsplash.com/photo-1562376502-6f769499c886?w=500&q=80", category: "Desserts" }
      ];
    case 3: // Dogar Restaurant
      return [
        { _id: "dog1", name: "Special Chicken Biryani", price: 320, description: "Lahori-style spicy chicken biryani with boiled egg and raita.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80", category: "Traditional" },
        { _id: "dog2", name: "Seekh Kabab (2 Pcs)", price: 240, description: "Minced beef skewers spiced with herbs and grilled over charcoal.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&q=80", category: "Traditional" },
        { _id: "dog3", name: "Dogar Haleem", price: 220, description: "Slow-cooked stew of wheat, barley, meat, and lentils, served with lemon and ginger.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80", category: "Traditional" },
        { _id: "dog4", name: "Chicken Shawarma", price: 180, description: "Shaved spiced chicken wrapped in pita bread with garlic sauce and pickles.", image: "https://images.unsplash.com/photo-1662143494793-1b9136fe9f33?w=500&q=80", category: "Fast Food" },
        { _id: "dog5", name: "Chicken Paratha Roll", price: 230, description: "Juicy chicken tikka boti rolled in a crispy, flaky golden paratha.", image: "https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500&q=80", category: "Fast Food" },
        { _id: "dog6", name: "Doodh Patti Chai", price: 90, description: "Rich, strong Lahori tea brewed in pure milk.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80", category: "Beverages" },
        { _id: "dog7", name: "Karak Chai", price: 110, description: "Spiced hot tea with cardamom and condensed milk.", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80", category: "Beverages" },
        { _id: "dog8", name: "Gulab Jamun (2 Pcs)", price: 130, description: "Warm, sweet milk-solid balls soaked in rose-flavored sugar syrup.", image: "https://images.unsplash.com/photo-1589135284962-d9f2d1591873?w=500&q=80", category: "Desserts" },
        { _id: "dog9", name: "Ras Malai (2 Pcs)", price: 180, description: "Soft cottage cheese patties soaked in sweetened, saffron-infused milk.", image: "https://images.unsplash.com/photo-1589135284962-d9f2d1591873?w=500&q=80", category: "Desserts" }
      ];
    default:
      return [];
  }
};

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

  // ── WebSocket Real-Time Tracking (Deactivated - Tracked via WhatsApp) ──
  /*
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
  */

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
    const canteenName = POPULAR_CANTEENS[selectedVisualIndex]?.name || "Cafe Aroma";
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
    if (nameLower.match(/(pastry|cake|brownie|dessert|sweet|ice cream)/) || descLower.match(/(pastry|cake|brownie|dessert|sweet|ice cream)/)) return "Desserts";
    return "Fast Food";
  };

  // ── Filtered Menu ─────────────────────────────────────────────────
  const filteredMenu = getCanteenMenu(selectedVisualIndex).filter((item) => {
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
    <div className="flex min-h-screen bg-[#faf8f5] font-sans text-slate-800">
      <div className="flex flex-1 min-w-0 w-full animate-fade-in">
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
                  POPULAR_CANTEENS={POPULAR_CANTEENS}
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
                <div className="flex flex-col gap-5">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-center">
                    <span className="text-5xl block mb-4">💬</span>
                    <h3 className="text-[15px] font-black text-[#0a2342] uppercase tracking-wide mb-1">
                      WhatsApp Order Tracking
                    </h3>
                    <p className="text-[11.5px] text-slate-400 font-semibold mb-6 max-w-md mx-auto leading-relaxed">
                      Your order has been placed. Order tracking is handled directly via WhatsApp calls and messages. Click below to contact the restaurant canteen kitchen.
                    </p>

                    {activeOrder ? (
                      <div className="max-w-md mx-auto bg-slate-50 border border-slate-100 p-5 rounded-2xl text-left mb-6">
                        <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                          <span className="text-[10.5px] font-bold text-slate-400 uppercase">Order ID</span>
                          <span className="text-[11px] font-black text-[#0a2342]">{activeOrder._id}</span>
                        </div>
                        <div className="flex justify-between items-center py-2.5 border-b border-slate-200">
                          <span className="text-[10.5px] font-bold text-slate-400 uppercase">Restaurant</span>
                          <span className="text-[11.5px] font-black text-[#0a2342]">
                            {restaurantsList.find(r => r._id === activeOrder.restaurant)?.name || "Campus Bites"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2.5">
                          <span className="text-[10.5px] font-bold text-slate-400 uppercase">Total Amount</span>
                          <span className="text-xs font-black text-orange-600">Rs. {activeOrder.totalAmount}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-slate-400 mb-6">No active order found.</p>
                    )}

                    <a
                      href={`https://wa.me/${(restaurantsList.find(r => r._id === activeOrder?.restaurant || r._id === activeRestaurant)?.phone || "+923001234567").replace(/[^0-9+]/g, "")}?text=${encodeURIComponent("Hi! I would like to track my order ID " + (activeOrder?._id || ""))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-none py-3 px-8 rounded-2xl text-[12px] font-black tracking-wider uppercase cursor-pointer transition-all shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] focus:outline-none"
                    >
                      💬 Track Order via WhatsApp
                    </a>
                  </div>
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
    </div>
  );
}
