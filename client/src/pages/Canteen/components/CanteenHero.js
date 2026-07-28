import React from "react";

export default function CanteenHero({
  user,
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
  setActiveTab,
}) {
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <section className="flex flex-col gap-6 w-full">
      {/* Hero Banner Card (Matching Forum & Career design) */}
      <div className="bg-[#071A35] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white border border-[#071A35] shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col text-left z-10">
          <div className="bg-white/10 text-[#F5B82E] text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-3 border border-white/10">
            <span>🍔</span>
            <span>{getGreeting()}, {user?.name || "Student"} 👏</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-1.5">
            What's on your plate today?
          </h1>
          <p className="text-xs font-semibold text-white/70 max-w-[550px] leading-relaxed m-0">
            Order fresh meals, track live delivery progression, and explore canteens across campus.
          </p>
        </div>

        {/* Location Dropdown selector (Pill capsule) */}
        <div className="relative shrink-0 self-start sm:self-center z-10 w-full sm:w-auto">
          <button
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 rounded-full bg-[#F5B82E] hover:bg-[#FFD05B] text-[#071A35] px-4 sm:px-5 py-2.5 sm:py-3 text-xs font-black transition-all duration-200 cursor-pointer shadow-md border-none"
          >
            <div className="flex items-center gap-2 truncate">
              <svg
                className="w-4 h-4 text-[#071A35] shrink-0 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate max-w-[160px] sm:max-w-none">{deliveryLocation}</span>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-[#071A35] shrink-0 transition-transform duration-300 ${
                isLocationDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isLocationDropdownOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-12 sm:top-14 z-30 w-[270px] sm:w-[320px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.12)] animate-fade-in">
              <div className="p-3.5 border-b border-slate-100 bg-[#071A35]/5 flex items-center justify-between">
                <span className="text-[10px] font-black text-[#071A35] uppercase tracking-widest block">
                  Select Delivery Spot
                </span>
                <span className="text-[9px] font-extrabold bg-[#00c2cb]/15 px-2.5 py-0.5 rounded-full text-[#0079c2]">
                  6 Spots
                </span>
              </div>
              <div className="max-h-[260px] overflow-y-auto scrollbar-none py-1.5">
                {CAMPUS_LOCATIONS.map((loc) => {
                  const isSelected = deliveryLocation === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => {
                        setDeliveryLocation(loc);
                        setIsLocationDropdownOpen(false);
                      }}
                      className={`w-full px-4 sm:px-5 py-3 text-left text-xs font-bold border-b border-slate-50 last:border-b-0 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "text-[#0079c2] bg-[#00c2cb]/10"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#0a2342]"
                      }`}
                    >
                      <span className="truncate">{loc}</span>
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 text-[#00c2cb] shrink-0 ml-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search & Toggle Row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center">
        {/* Search Input Card */}
        <div className="relative w-full">
          <label htmlFor="canteen-search-input" className="sr-only">
            Search for food or restaurants
          </label>
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            id="canteen-search-input"
            name="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for food or restaurants..."
            className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-[#0a2342] shadow-[0_4px_12px_rgba(0,0,0,0.015)] outline-none focus:border-[#00c2cb] focus:ring-4 focus:ring-[#00c2cb]/15 transition-all duration-300 placeholder-slate-400"
          />
        </div>

        {/* Tab Selection Row (Browse, Active Order) */}
        <div className="flex gap-2 sm:gap-2.5 shrink-0 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          {[
            { id: "browse", label: "Browse Menu", icon: "🍽️" },
            { id: "track", label: "Active Order", icon: "🛵" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`h-11 rounded-2xl px-4 sm:px-5 text-xs font-bold tracking-wide transition-all duration-300 flex-1 sm:flex-initial flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                  isActive
                    ? "bg-[#071A35] text-white shadow-md shadow-[#071A35]/20 border border-[#071A35]"
                    : "bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 hover:text-[#071A35] hover:border-slate-300"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="font-extrabold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}