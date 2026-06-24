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
      {/* Header Row: Title & Greeting on Left, Location Dropdown on Right */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-slate-400">
            {getGreeting()}, {user?.name || "Student"} 👏
          </span>
          <h1 className="text-3xl font-extrabold text-[#0a2342] mt-1 tracking-tight">
            What's on your plate today?
          </h1>
        </div>

        {/* Location Dropdown selector (Pill capsule) */}
        <div className="relative shrink-0 self-start md:self-center">
          <button
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
            className="flex items-center gap-2.5 rounded-full bg-[#fff5f2] border border-[#e87a5d]/20 px-5 py-2.5 text-xs font-black text-[#e87a5d] hover:shadow-[0_4px_12px_rgba(232,122,93,0.08)] transition-all duration-200 focus:outline-none cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-[#e87a5d] shrink-0 animate-pulse"
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
            <span>{deliveryLocation}</span>
            <svg
              className={`w-3 h-3 text-[#e87a5d]/70 shrink-0 transition-transform duration-300 ${
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
            <div className="absolute right-0 top-13 z-30 w-[320px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-md:left-0 max-md:right-auto animate-fade-in">
              <div className="p-3.5 border-b border-slate-100 bg-[#fff5f2]/40 flex items-center justify-between">
                <span className="text-[10px] font-black text-[#e87a5d] uppercase tracking-widest block">
                  Select Delivery Spot
                </span>
                <span className="text-[9px] font-extrabold bg-[#e87a5d]/10 px-2 py-0.5 rounded-full text-[#e87a5d]">
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
                      className={`w-full px-5 py-3 text-left text-xs font-bold border-b border-slate-50 last:border-b-0 transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "text-[#e87a5d] bg-[#fff5f2]/60"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#0a2342]"
                      }`}
                    >
                      <span>{loc}</span>
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 text-[#e87a5d] shrink-0"
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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        {/* Search Input Card */}
        <div className="relative w-full">
          <span className="absolute left-4.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for food or restaurants..."
            className="w-full h-12 pl-12 pr-5 bg-white border border-slate-200/80 rounded-2xl text-xs font-semibold text-[#0a2342] shadow-[0_4px_12px_rgba(0,0,0,0.015)] outline-none focus:border-[#e87a5d] focus:ring-4 focus:ring-[#e87a5d]/5 transition-all duration-300 placeholder-slate-400"
          />
        </div>

        {/* Tab Selection Row (Browse, Deals, Active Order) */}
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "browse", label: "Browse Menu", icon: "🍽️" },
            { id: "deals", label: "Student Deals", icon: "🏷️" },
            { id: "track", label: "Active Order", icon: "🛵" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-3 text-xs font-black transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap focus:outline-none ${
                  isActive
                    ? "bg-[#fff1f2] text-[#e87a5d] shadow-[0_2px_8px_-4px_rgba(232,122,93,0.2)] border border-orange-100"
                    : "bg-white border border-slate-200/80 text-slate-500 hover:bg-slate-50 hover:text-[#0a2342]"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}