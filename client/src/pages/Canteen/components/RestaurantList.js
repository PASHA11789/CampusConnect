import React from "react";

const getCanteenDisplayInfo = (res) => {
  return {
    name: res.name,
    rating: res.rating || "4.8",
    prepTime: "10-20 min",
    tags: "Campus Eatery",
    image: res.coverImage || res.owner?.avatar || res.avatar || "",
    status: res.isActive ? "Open" : "Closed"
  };
};

export default function RestaurantList({
  restaurants,
  activeRestaurant,
  setActiveRestaurant,
  setSelectedCategory,
  selectedVisualIndex,
  setSelectedVisualIndex,
}) {
  const displayRestaurants = restaurants && restaurants.length > 0 ? restaurants : [];

  return (
    <section className="flex flex-col gap-4">
      {/* Header with Step Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#071A35] to-[#0079c2] text-white text-[11px] font-black shadow-xs">
            1
          </span>
          <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
            Select a Campus Canteen
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/70 shadow-2xs">
          {displayRestaurants.length} Restaurants Available
        </span>
      </div>

      {/* Grid Layout of Dynamic Canteens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayRestaurants.map((res, index) => {
          const backendId = res._id || res.id;
          const isSelected = activeRestaurant === backendId || (index === selectedVisualIndex && !activeRestaurant);
          const displayInfo = getCanteenDisplayInfo(res);

          return (
            <button
              key={backendId}
              onClick={() => {
                setActiveRestaurant(backendId);
                setSelectedVisualIndex(index);
                setSelectedCategory("All");
                const menuEl = document.getElementById("canteen-menu-section");
                if (menuEl) {
                  menuEl.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className={`group flex flex-col overflow-hidden rounded-3xl text-left transition-all duration-300 w-full relative cursor-pointer ${
                isSelected
                  ? "border-2 border-[#071A35] shadow-[0_14px_35px_rgba(7,26,53,0.15)] bg-white -translate-y-1"
                  : "border border-slate-200/90 bg-white shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-[#071A35]/30"
              }`}
            >
              {/* Active Glow Ribbon */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#071A35] via-[#0079c2] to-[#00c2cb] z-20" />
              )}

              {/* Image Container with Rating & Status Badge */}
              <div className="h-36 w-full overflow-hidden relative shrink-0">
                <img
                  src={displayInfo.image}
                  alt={displayInfo.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10.5px] font-extrabold text-[#0a2342] shadow-md border border-slate-100 z-10">
                  <span className="text-amber-500">★</span>
                  <span>{displayInfo.rating}</span>
                </div>

                {/* Selection Badge overlay */}
                {isSelected && (
                  <div className="absolute top-3 left-3 bg-[#071A35] text-white text-[9.5px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-white/20 flex items-center gap-1.5 z-20">
                    <span className="w-2 h-2 rounded-full bg-[#00c2cb] animate-pulse"></span>
                    <span>Selected</span>
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#0a2342] truncate leading-tight group-hover:text-[#0079c2] transition-colors">
                    {displayInfo.name}
                  </h4>
                </div>
                
                <p className="text-[10px] font-semibold text-slate-400 truncate">
                  {displayInfo.tags}
                </p>

                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[10px] font-extrabold text-slate-600 flex items-center gap-1">
                    🛵 {displayInfo.prepTime}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    displayInfo.status === "Open" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}>
                    {displayInfo.status}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}