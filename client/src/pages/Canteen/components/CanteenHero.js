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
  setActiveTab,
}) {
  return (
    <section className="relative overflow-visible rounded-[34px] bg-gradient-to-br from-[#e2725b] via-[#f08a69] to-[#ffb199] p-7 shadow-lg">
      <div className="absolute right-8 top-5 text-[90px] opacity-20">🍔</div>

      <div className="relative z-10 flex flex-col gap-5">
        <div>
          <span className="inline-flex rounded-full bg-white/25 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-white">
            Campus Canteen
          </span>
          <h1 className="mt-3 text-4xl font-black text-white max-md:text-2xl">
            Order food around campus
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-white/90">
            Browse restaurants, customize meals, apply student deals and track delivery live.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 max-md:grid-cols-1">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search biryani, burger, coffee..."
            className="h-13 rounded-2xl border border-white/40 bg-white px-5 text-sm font-semibold outline-none"
          />

          <div className="flex gap-2">
            {["delivery", "pickup"].map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`rounded-2xl px-5 py-3 text-xs font-black uppercase transition ${orderType === type
                  ? "bg-[#0a2342] text-white"
                  : "bg-white/80 text-[#0a2342]"
                  }`}
              >
                {type === "delivery" ? "Delivery" : "Pickup"}
              </button>
            ))}
          </div>
        </div>

        {orderType === "delivery" && (
          <div className="relative w-fit max-md:w-full">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="w-full rounded-2xl bg-white px-5 py-3 text-left text-xs font-bold text-[#0a2342] shadow-sm"
            >
              📍 {deliveryLocation}
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute left-0 top-14 z-30 w-[320px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl max-md:w-full">
                {CAMPUS_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setDeliveryLocation(loc);
                      setIsLocationDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-3 text-left text-xs font-bold text-slate-600 hover:bg-[#fff4ef]"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {[
            { id: "browse", label: "Browse Menu", icon: "🍽️" },
            { id: "deals", label: "Deals", icon: "🏷️" },
            { id: "track", label: "Track Order", icon: "🛵" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-5 py-3 text-xs font-black transition ${activeTab === tab.id
                ? "bg-white text-[#e2725b]"
                : "bg-white/20 text-white hover:bg-white/30"
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}