import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// Layout Components

import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

// Importing generated images from src/assets
import gourmetImg from "../../assets/gourmet.png";
import savourImg from "../../assets/savour.png";

const RESTAURANTS = [
  { id: "gourmet", name: "Gourmet Café", distance: "0.2 km", image: gourmetImg, rating: 4.5 },
  { id: "savour", name: "Savour Foods", distance: "0.5 km", image: savourImg, rating: 4.8 },
  { id: "pizza", name: "Pizza Online", distance: "0.8 km", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80", rating: 4.2 },
  { id: "bbq", name: "Bundu Khan BBQ", distance: "1.1 km", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80", rating: 4.6 }
];

const MENU_ITEMS = {
  gourmet: [
    { id: "g1", name: "Chicken Club Sandwich", price: 320, category: "Fast Food", desc: "Classic double-decker sandwich with grilled chicken, egg, and fresh veggies.", image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&q=80", popularity: "best seller" },
    { id: "g2", name: "Crispy Chicken Zinger", price: 380, category: "Fast Food", desc: "Golden fried crispy chicken fillet topped with spicy mayo and lettuce.", image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=400&q=80", popularity: "popular" },
    { id: "g3", name: "Loaded Cheese Fries", price: 220, category: "Fast Food", desc: "Crispy french fries drenched in rich cheese sauce and jalapenos.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80" },
    { id: "g4", name: "Cappuccino coffee", price: 240, category: "Beverages", desc: "Rich espresso blend topped with creamy frothed milk foam.", image: "https://images.unsplash.com/photo-1571934811356-5cc561b63d2c?w=400&q=80" },
    { id: "g5", name: "Chilled Peach Ice Tea", price: 160, category: "Beverages", desc: "Sweet, refreshing brewed tea infused with fresh peach flavors.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80" },
    { id: "g6", name: "Fudge Chocolate Brownie", price: 150, category: "Desserts", desc: "Dense, chewy chocolate brownie served warm with fudge syrup.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80" }
  ],
  savour: [
    { id: "s1", name: "Savour Pulao Kabab", price: 450, category: "Traditional", desc: "Fragrant rice served with two Shami Kababs and succulent chicken roast.", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400&q=80", popularity: "best seller" },
    { id: "s2", name: "Chicken Roast Quarter", price: 290, category: "Traditional", desc: "Perfectly seasoned, crispy fried chicken leg or breast quarter.", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80" },
    { id: "s3", name: "Extra Shami Kabab", price: 90, category: "Traditional", desc: "Single golden fried chicken & lentil shami kabab.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&q=80" },
    { id: "s4", name: "Fresh Mint Raita", price: 60, category: "Traditional", desc: "Cool yogurt dip whisked with fresh mint leaves and spices.", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80" },
    { id: "s5", name: "Mineral Water (Regular)", price: 80, category: "Beverages", desc: "Clean bottled drinking water.", image: "https://images.unsplash.com/photo-1608885898957-a599fb1698d6?w=400&q=80" }
  ],
  pizza: [
    { id: "p1", name: "Chicken Tikka Pizza (Small)", price: 690, category: "Fast Food", desc: "Local favorite! Tender chicken tikka chunks, onions, and rich mozzarella.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80", popularity: "best seller" },
    { id: "p2", name: "Fajita Supreme Pizza (Small)", price: 720, category: "Fast Food", desc: "Fajita chicken, bell peppers, olives, onions, and melted cheese.", image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&q=80", popularity: "popular" },
    { id: "p3", name: "Garlic Bread with Cheese", price: 220, category: "Fast Food", desc: "Four pieces of crispy baguette topped with garlic butter and melted cheese.", image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400&q=80" },
    { id: "p4", name: "Chocolate Lava Cake", price: 280, category: "Desserts", desc: "Warm chocolate cake with a molten, gooey chocolate center.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80" }
  ],
  bbq: [
    { id: "b1", name: "Chicken Boti Plate", price: 480, category: "Traditional", desc: "8 pieces of flame-grilled chicken breast cubes marinated in spices.", image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80", popularity: "best seller" },
    { id: "b2", name: "Beef Seekh Kabab Plate", price: 520, category: "Traditional", desc: "4 skewers of premium minced beef flame-grilled over burning charcoals.", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80", popularity: "popular" },
    { id: "b3", name: "Roghni Naan", price: 60, category: "Traditional", desc: "Fluffy tandoori flatbread topped with sesame seeds and butter glaze.", image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=400&q=80" },
    { id: "b4", name: "Fresh Mint Margerita", price: 180, category: "Beverages", desc: "Slushy blend of fresh mint leaves, lemon juice, sprite, and black salt.", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80" }
  ]
};

const INITIAL_REVIEWS = [
  { name: "Muhammad Bilal", rating: 5, comment: "Savour Pulao is always consistent. Fast service even during peak lunch hours!", date: "2026-05-29" },
  { name: "Zoya Sheikh", rating: 4, comment: "Gourmet Café has the best club sandwiches on campus. A bit pricey but worth it.", date: "2026-05-28" },
  { name: "Usama Syed", rating: 3, comment: "Bundu Khan Boti is delicious, but sometimes they take over 25 minutes to prepare.", date: "2026-05-27" }
];

export default function Canteen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Canteen States
  const [activeRestaurant, setActiveRestaurant] = useState("gourmet");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);

  // Review Section States
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Live Tracking Modal States
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingStep, setTrackingStep] = useState(1);
  const [orderId, setOrderId] = useState("");

  // Authenticate user on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        setNewReviewName(parsedUser.name);
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (e) { }
    }

    const fetchUserProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/auth/profile", config);

        setUser(data);
        setNewReviewName(data.name);
        if (data.avatar) {
          setAvatar(data.avatar);
        }
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch latest user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // Handle Profile Avatar Changes
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setIsUploading(true);

    const token = sessionStorage.getItem("token");
    if (!token) {
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put("/api/auth/update-avatar", formData, config);

      if (data.avatar) {
        setAvatar(data.avatar);
        const userStr = sessionStorage.getItem("user");
        if (userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            const updatedUser = { ...parsedUser, avatar: data.avatar };
            setUser(updatedUser);
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          } catch (err) {
            console.error("Failed to update user object in local storage:", err);
          }
        }
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
      alert(error.response?.data?.message || "Failed to upload avatar. Please try again.");
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          setAvatar(parsedUser.avatar || null);
        } catch (err) { }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  // Cart operations
  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci
        );
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
  };

  const handleAdjustQty = (itemId, change) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (ci.id === itemId) {
            const newQty = ci.qty + change;
            return { ...ci, qty: newQty };
          }
          return ci;
        })
        .filter((ci) => ci.qty > 0);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, ci) => acc + ci.price * ci.qty, 0);
  const platformFee = cart.length > 0 ? 15 : 0;
  const gstTax = Math.round(cartSubtotal * 0.16); // 16% GST
  const cartTotal = cartSubtotal + platformFee + gstTax;

  // Checkout and tracking progression
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Generate mock order ID
    const randomId = "CC-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomId);
    setCart([]);
    setIsTrackingOpen(true);
    setTrackingStep(1);
  };

  // Simulate Order Tracking Loops
  useEffect(() => {
    let interval = null;
    if (isTrackingOpen && trackingStep < 4) {
      interval = setInterval(() => {
        setTrackingStep((prev) => {
          if (prev >= 4) {
            clearInterval(interval);
            return 4;
          }
          return prev + 1;
        });
      }, 4000); // Progresses step every 4 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTrackingOpen, trackingStep]);

  // Review submission
  const handlePostReview = (e) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const newRev = {
      name: newReviewName || "Anonymous Student",
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split("T")[0]
    };

    setReviews([newRev, ...reviews]);
    setNewReviewComment("");
    setNewReviewRating(5);
  };

  // Filter menu items based on selected category and search input
  const currentMenu = MENU_ITEMS[activeRestaurant] || [];
  const filteredMenu = currentMenu.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Fast Food", "Traditional", "Beverages", "Desserts"];

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
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
          {/* ── CANTEEN HEADER ── */}
          <div className="flex justify-between items-center mb-6 max-md:flex-col max-md:items-start max-md:gap-4">
            <div>
              <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">Campus Canteen & Eateries</h1>
              <p className="text-[12px] text-slate-500 mt-1 font-semibold">Order fresh meals directly from campus shops and nearby student hubs.</p>
            </div>
            <div className="flex items-center">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-full shadow-sm">
                <svg className="w-4 h-4 text-slate-400 ml-3.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search dishes or items..."
                  className="w-[240px] max-md:w-full bg-transparent border-none text-[13px] font-semibold text-[#0a2342] placeholder-slate-400 focus:outline-none py-2 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── RESTAURANT TABS GRID ── */}
          <div>
            <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide mb-3.5">Select Restaurant or Cafeteria</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 pr-1 scrollbar-thin">
              {RESTAURANTS.map((res) => (
                <div
                  key={res.id}
                  className={`flex-shrink-0 w-[200px] bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md group ${activeRestaurant === res.id ? "border-[#00c2cb] ring-2 ring-[#00c2cb]/10" : "border-slate-200"}`}
                  onClick={() => {
                    setActiveRestaurant(res.id);
                    setSelectedCategory("All");
                  }}
                >
                  <div className="relative h-[90px] overflow-hidden">
                    <img src={res.image} alt={res.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="absolute top-2 left-2 bg-[#00c2cb]/90 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">{res.distance}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-1">
                    <h4 className="text-[13px] font-bold text-[#0a2342] m-0">{res.name}</h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                      <span className="text-[#fbbf24]">★</span>
                      <span>{res.rating}</span>
                      <span style={{ color: "#cbd5e1" }}>•</span>
                      <span style={{ fontSize: "10.5px" }}>Reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── MAIN CANTEEN PAGE CONTENT GRID ── */}
          <div className="grid grid-cols-[1fr_280px] gap-6 max-[1100px]:grid-cols-1">

            {/* ── LEFT PANE: MENU GRID ── */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`px-4 py-2 rounded-full border text-[12px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? "bg-[#00c2cb] border-[#00c2cb] text-white hover:bg-[#00b2bb]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#00c2cb] hover:border-[#00c2cb]"}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                {filteredMenu.length > 0 ? (
                  filteredMenu.map((item) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 group">
                      <div className="relative w-[110px] shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {item.popularity && <span className="absolute top-2 left-2 bg-[#fbbf24] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{item.popularity}</span>}
                      </div>
                      <div className="p-3 flex-1 flex flex-col gap-1 min-w-0">
                        <h4 className="text-[13.5px] font-extrabold text-[#0a2342] truncate">{item.name}</h4>
                        <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">{item.desc}</p>
                        <div className="flex justify-between items-center mt-auto pt-2">
                          <span className="text-[13.5px] font-black text-[#00c2cb]">Rs. {item.price}</span>
                          <button
                            className="bg-[#0a2342] text-white border-none py-1.5 px-3 rounded-lg text-[11px] font-bold cursor-pointer transition-all hover:bg-[#00c2cb] flex items-center gap-1"
                            onClick={() => handleAddToCart(item)}
                          >
                            <span>+</span> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 max-md:col-span-1 p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-[32px] mb-2">🍽️</span>
                    <h4 className="text-[14px] font-bold text-[#0a2342] mb-1">No items found</h4>
                    <p className="text-[12px] text-slate-500 font-medium">Try searching for a different dish or category.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT PANE: CART SIDE PANEL ── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-[22px] flex flex-col h-fit sticky top-[90px] shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-[14px] font-black text-[#0a2342]">My Order Cart</h3>
                {cart.length > 0 && <span className="text-[11px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">{cart.reduce((sum, i) => sum + i.qty, 0)} items</span>}
              </div>

              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {cart.length > 0 ? (
                  cart.map((ci) => (
                    <div key={ci.id} className="flex justify-between items-center py-2 border-b border-slate-50 [&:last-child]:border-none">
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <h5 className="text-[12px] font-bold text-[#0a2342] truncate">{ci.name}</h5>
                        <span className="text-[11px] text-slate-400 font-semibold">Rs. {ci.price * ci.qty}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[12px] flex items-center justify-center border-none cursor-pointer" onClick={() => handleAdjustQty(ci.id, -1)}>-</button>
                        <span className="text-[12px] font-bold text-[#0a2342] min-w-[14px] text-center">{ci.qty}</span>
                        <button className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[12px] flex items-center justify-center border-none cursor-pointer" onClick={() => handleAdjustQty(ci.id, 1)}>+</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-[12.5px] text-slate-400 font-semibold flex flex-col items-center justify-center gap-1.5">
                    <span className="text-2xl opacity-60">🛒</span>
                    Your cart is empty.
                    <span style={{ fontSize: "10.5px", display: "block", marginTop: "4px", color: "#cbd5e1" }}>Add delicious meals to check out!</span>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <>
                  <div className="border-t border-slate-100 pt-3 mt-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[12px] text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span>Rs. {cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] text-slate-500 font-medium">
                      <span>GST (16%)</span>
                      <span>Rs. {gstTax}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] text-slate-500 font-medium">
                      <span>Service / Packaging</span>
                      <span>Rs. {platformFee}</span>
                    </div>
                    <div className="text-[13px] text-[#0a2342] font-black border-t border-slate-100 pt-2.5 mt-1 flex justify-between items-center">
                      <span>Total Bill</span>
                      <span>Rs. {cartTotal}</span>
                    </div>
                  </div>

                  <button className="w-full bg-[#00c2cb] text-white border-none py-2 px-4 rounded-xl text-[12.5px] font-bold cursor-pointer transition-all duration-200 hover:bg-[#00b2bb] hover:shadow-md mt-4" onClick={handleCheckout}>
                    Checkout Order ➔
                  </button>
                  <button
                    onClick={handleClearCart}
                    style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "11px", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}
                  >
                    Clear Cart
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── BOTTOM FEEDBACK & REVIEWS ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-[22px] mt-4 flex flex-col gap-4">
            <div className="reviews-header">
              <h3 className="text-[14px] font-black text-[#0a2342]">Community Ratings & Reviews</h3>
            </div>

            <div className="grid grid-cols-[1fr_320px] gap-6 max-[800px]:grid-cols-1">

              {/* ── LEFT: REVIEWS SCROLL LIST ── */}
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[12.5px] font-bold text-[#0a2342]">{rev.name}</span>
                      <div className="flex items-center gap-0.5 text-[11px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < rev.rating ? "text-[#fbbf24]" : "text-slate-200"}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[12.5px] text-slate-600 leading-normal italic">"{rev.comment}"</p>
                    <span className="text-[9.5px] text-slate-400 font-medium mt-1">{rev.date}</span>
                  </div>
                ))}
              </div>

              {/* ── RIGHT: WRITE A REVIEW FORM ── */}
              <form onSubmit={handlePostReview} className="flex flex-col gap-3.5 bg-slate-50 border border-slate-200 rounded-xl p-4 h-fit">
                <h4 className="text-[13px] font-extrabold text-[#0a2342]">Share Your Experience</h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#0a2342" }}>Select Rating</span>
                  <div className="flex gap-1 text-[18px] text-slate-200 cursor-pointer">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const ratingVal = i + 1;
                      return (
                        <span
                          key={i}
                          className={ratingVal <= newReviewRating ? "text-[#fbbf24]" : ""}
                          onClick={() => setNewReviewRating(ratingVal)}
                        >
                          ★
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="review-desc" style={{ fontSize: "11.5px", fontWeight: "700", color: "#0a2342" }}>Write Your Feedback</label>
                  <textarea
                    id="review-desc"
                    placeholder="Tell other students about the food quality, price, or preparation speed..."
                    className="w-full px-3 py-2 text-[12px] font-medium border border-slate-200 rounded-lg min-h-[90px] focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="w-full bg-[#0a2342] text-white border-none py-2 px-4 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all hover:bg-[#00c2cb]">
                  Post Review
                </button>
              </form>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="mt-5 py-3 border-t border-slate-200 text-center">
            <p className="text-[12px] text-slate-400 font-medium tracking-wide">
              © 2026 CampusConnect. An idea by <span className="text-[#0a2342] font-bold">Mr. Sagheer Ahmad</span> &{" "}
              <span className="text-[#0a2342] font-bold">Mr. Shujaat Ali Hashim</span>
            </p>
          </footer>
        </div>
      </main>

      {/* ── LIVE TRACKING MODAL ── */}
      {isTrackingOpen && (
        <div className="fixed inset-0 bg-[#0a2342]/40 backdrop-blur-[8px] flex items-center justify-center z-[2000] animate-modal-fade-in">
          <div className="w-[90%] max-w-[500px] bg-white rounded-[20px] p-6 shadow-2xl flex flex-col gap-4 animate-modal-slide-in">

            <div className="flex justify-between items-center">
              <h3 className="text-[16px] font-black text-[#0a2342] tracking-tight">Live Order Tracker</h3>
              <button className="bg-none border-none text-[26px] leading-none text-slate-400 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:bg-slate-100 hover:text-red-500" onClick={() => setIsTrackingOpen(false)}>×</button>
            </div>

            <div className="bg-[#00c2cb]/10 text-[#00c2cb] text-[13px] font-extrabold px-3 py-1 rounded-full w-fit">
              {trackingStep === 1 && "Order Placed"}
              {trackingStep === 2 && "In Kitchen"}
              {trackingStep === 3 && "Out for Delivery/Counter"}
              {trackingStep === 4 && "Ready for Pick Up!"}
            </div>

            <div style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569" }}>
              Order ID: <span style={{ color: "#00c2cb", fontWeight: "800" }}>{orderId}</span>
            </div>

            {/* PROGRESS BAR FILL */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-[#00c2cb] to-[#00acc1] transition-all duration-500"
                style={{ width: `${(trackingStep / 4) * 100}%` }}
              />
            </div>

            {/* TIMELINE STEPS */}
            <div className="flex flex-col gap-4 mt-2">
              <div className={`flex gap-3 ${trackingStep >= 1 ? (trackingStep === 1 ? "[&_.step-circle]:bg-[#00c2cb] [&_.step-circle]:ring-4 [&_.step-circle]:ring-[#00c2cb]/20 [&_span.step-title-lbl]:text-[#00c2cb] [&_span.step-title-lbl]:font-bold" : "[&_.step-circle]:bg-emerald-500 [&_span.step-title-lbl]:text-slate-800 [&_span.step-title-lbl]:font-semibold") : "[&_.step-circle]:bg-slate-200 [&_span.step-title-lbl]:text-slate-400"}`}>
                <div className="step-node-col">
                  <div className="step-circle w-3 h-3 rounded-full border border-white mt-1 shrink-0" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="step-title-lbl text-[12.5px]">Order Confirmed</span>
                  <span className="text-[11px] text-slate-400 font-medium">Your payment is verified and order is sent to the shop counters.</span>
                </div>
              </div>

              <div className={`flex gap-3 ${trackingStep >= 2 ? (trackingStep === 2 ? "[&_.step-circle]:bg-[#00c2cb] [&_.step-circle]:ring-4 [&_.step-circle]:ring-[#00c2cb]/20 [&_span.step-title-lbl]:text-[#00c2cb] [&_span.step-title-lbl]:font-bold" : "[&_.step-circle]:bg-emerald-500 [&_span.step-title-lbl]:text-slate-800 [&_span.step-title-lbl]:font-semibold") : "[&_.step-circle]:bg-slate-200 [&_span.step-title-lbl]:text-slate-400"}`}>
                <div className="step-node-col">
                  <div className="step-circle w-3 h-3 rounded-full border border-white mt-1 shrink-0" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="step-title-lbl text-[12.5px]">Preparing Meals</span>
                  <span className="text-[11px] text-slate-400 font-medium">The chef has accepted your order and ingredients are being prepped.</span>
                </div>
              </div>

              <div className={`flex gap-3 ${trackingStep >= 3 ? (trackingStep === 3 ? "[&_.step-circle]:bg-[#00c2cb] [&_.step-circle]:ring-4 [&_.step-circle]:ring-[#00c2cb]/20 [&_span.step-title-lbl]:text-[#00c2cb] [&_span.step-title-lbl]:font-bold" : "[&_.step-circle]:bg-emerald-500 [&_span.step-title-lbl]:text-slate-800 [&_span.step-title-lbl]:font-semibold") : "[&_.step-circle]:bg-slate-200 [&_span.step-title-lbl]:text-slate-400"}`}>
                <div className="step-node-col">
                  <div className="step-circle w-3 h-3 rounded-full border border-white mt-1 shrink-0" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="step-title-lbl text-[12.5px]">Out for Delivery / Counter Pickup</span>
                  <span className="text-[11px] text-slate-400 font-medium">Rider is dispatching or packaging is being assembled at counter.</span>
                </div>
              </div>

              <div className={`flex gap-3 ${trackingStep >= 4 ? (trackingStep === 4 ? "[&_.step-circle]:bg-[#00c2cb] [&_.step-circle]:ring-4 [&_.step-circle]:ring-[#00c2cb]/20 [&_span.step-title-lbl]:text-[#00c2cb] [&_span.step-title-lbl]:font-bold" : "[&_.step-circle]:bg-emerald-500 [&_span.step-title-lbl]:text-slate-800 [&_span.step-title-lbl]:font-semibold") : "[&_.step-circle]:bg-slate-200 [&_span.step-title-lbl]:text-slate-400"}`}>
                <div className="step-node-col">
                  <div className="step-circle w-3 h-3 rounded-full border border-white mt-1 shrink-0" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="step-title-lbl text-[12.5px]">Ready for Pick Up / Delivered</span>
                  <span className="text-[11px] text-slate-400 font-medium">Please show order ID at counter or expect your rider shortly!</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button className="bg-[#0a2342] text-white border-none py-2 px-6 rounded-lg text-[12.5px] font-bold cursor-pointer transition-all hover:bg-[#00c2cb]" onClick={() => setIsTrackingOpen(false)}>
                Okay
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
