import React from "react";

export default function CanteenHero({
  orderType,
  setOrderType,
  deliveryLocation,
  setDeliveryLocation,
  CAMPUS_LOCATIONS,
  isLocationDropdownOpen,
  setIsLocationDropdownOpen,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab
}) {
  return (
    <div className="flex flex-col gap-6 shrink-0">
      {/* ── TOP HEADER & LOCATION SELECTOR ── */}
      <div className="flex justify-between items-center mb-1 max-md:flex-col max-md:items-start max-md:gap-4">
        <div className="relative">
          <h1 className="text-[24px] font-extrabold text-[#0a2342] tracking-tight">Campus Canteen & Eateries</h1>
          
          {/* Location Selector Trigger */}
          <button 
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="text-[12px] text-slate-500 mt-1 font-bold flex items-center gap-1.5 cursor-pointer hover:text-[#00c2cb] transition-colors focus:outline-none bg-transparent border-none p-0"
          >
            <span>📍 Delivering to:</span>
            <span className="text-[#0a2342] underline">{orderType === "pickup" ? "Self-Pickup at counter" : deliveryLocation}</span>
            <span className="text-[#00c2cb] font-semibold">(15-25m)</span>
            <span>▾</span>
          </button>

          {/* Location & OrderType Dropdown */}
          {isLocationDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsLocationDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 z-40 flex flex-col gap-3.5 animate-modal-slide-in">
                <div>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Order Method</span>
                  <div className="flex gap-2 mt-1.5 bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setOrderType("delivery")}
                      className={`flex-1 py-1.5 text-[11.5px] font-bold rounded-lg cursor-pointer transition-all border-none ${orderType === "delivery" ? "bg-white text-[#0a2342] shadow-sm" : "text-slate-500 hover:text-slate-800 bg-transparent"}`}
                    >
                      🛵 Delivery
                    </button>
                    <button 
                      onClick={() => setOrderType("pickup")}
                      className={`flex-1 py-1.5 text-[11.5px] font-bold rounded-lg cursor-pointer transition-all border-none ${orderType === "pickup" ? "bg-white text-[#0a2342] shadow-sm" : "text-slate-500 hover:text-slate-800 bg-transparent"}`}
                    >
                      🎒 Pickup
                    </button>
                  </div>
                </div>

                {orderType === "delivery" && (
                  <div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Delivery Location</span>
                    <div className="flex flex-col gap-1 mt-1.5">
                      {CAMPUS_LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          onClick={() => {
                            setDeliveryLocation(loc);
                            setIsLocationDropdownOpen(false);
                          }}
                          className={`w-full text-left py-1.5 px-2.5 text-[11.5px] font-semibold rounded-lg cursor-pointer transition-all border-none ${deliveryLocation === loc ? "bg-[#00c2cb]/10 text-[#00c2cb]" : "text-slate-600 hover:bg-slate-50 bg-transparent"}`}
                        >
                          📍 {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Search row with search filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-white border border-slate-200/80 rounded-full shadow-sm">
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

      {/* ── PREMIUM TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200/80 mb-2 relative shrink-0">
        <button
          onClick={() => setActiveTab("browse")}
          className={`pb-3 px-6 text-[14px] font-extrabold transition-all relative focus:outline-none cursor-pointer flex items-center gap-2 border-none bg-transparent ${
            activeTab === "browse" ? "text-[#00c2cb]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          🍕 <span>Browse Menu</span>
          {activeTab === "browse" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00c2cb] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("deals")}
          className={`pb-3 px-6 text-[14px] font-extrabold transition-all relative focus:outline-none cursor-pointer flex items-center gap-2 border-none bg-transparent ${
            activeTab === "deals" ? "text-[#00c2cb]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          🏷️ <span>Deals & Offers</span>
          {activeTab === "deals" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00c2cb] rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`pb-3 px-6 text-[14px] font-extrabold transition-all relative focus:outline-none cursor-pointer flex items-center gap-2 border-none bg-transparent ${
            activeTab === "track" ? "text-[#00c2cb]" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          🛵 <span>Order Track</span>
          {activeTab === "track" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00c2cb] rounded-t-full" />}
        </button>
      </div>

      {activeTab === "browse" && (
        <>
          {/* ── FOOD DELIVERY APP HERO PROMO BANNER ── */}
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-100/30 min-h-[220px] flex items-center bg-slate-900 group shrink-0 animate-fade-in">
            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80" 
                alt="Delicious Food Collage" 
                className="w-full h-full object-cover opacity-35 transition-transform duration-[6s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
            </div>
            
            <div className="relative z-10 px-8 py-6 max-w-[65%] flex flex-col gap-3">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#00c2cb] bg-[#00c2cb]/10 px-3 py-1 rounded-full w-fit">
                ⚡ Minhaj Delivery Express
              </span>
              <h2 className="text-[24px] font-black leading-tight text-white tracking-tight">
                Hungry? Get fresh meals delivered to your desk in <span className="text-[#fbbf24]">15 mins!</span>
              </h2>
              <p className="text-[12.5px] text-slate-300 font-medium">
                Enjoy FREE delivery on all orders above Rs. 500 inside Minhaj University campus.
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById("select-restaurant-heading");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-premium border-none py-2.5 px-6 rounded-xl text-[12px] font-bold text-white cursor-pointer w-fit"
              >
                Order Now →
              </button>
            </div>
          </div>

          {/* ── FEATURES METRICS GRID ── */}
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
            <div className="bg-white p-4 rounded-2xl border border-slate-100/60 shadow-sm flex items-center gap-3.5 card-premium">
              <span className="text-3xl bg-teal-50 p-2 rounded-xl">⏱️</span>
              <div>
                <h4 className="text-[12.5px] font-extrabold text-[#0a2342] leading-tight">15 Min Delivery</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Lightning fast to your location</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100/60 shadow-sm flex items-center gap-3.5 card-premium">
              <span className="text-3xl bg-orange-50 p-2 rounded-xl">🛵</span>
              <div>
                <h4 className="text-[12.5px] font-extrabold text-[#0a2342] leading-tight">Free Delivery</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">On orders above Rs. 500</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100/60 shadow-sm flex items-center gap-3.5 card-premium">
              <span className="text-3xl bg-red-50 p-2 rounded-xl">🛡️</span>
              <div>
                <h4 className="text-[12.5px] font-extrabold text-[#0a2342] leading-tight">Hygienic & Safe</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Quality food from trusted shops</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100/60 shadow-sm flex items-center gap-3.5 card-premium">
              <span className="text-3xl bg-pink-50 p-2 rounded-xl">⭐</span>
              <div>
                <h4 className="text-[12.5px] font-extrabold text-[#0a2342] leading-tight">Top Rated</h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">Loved by thousands of students</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
