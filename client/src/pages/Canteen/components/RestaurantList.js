import React from "react";

const METADATA_MAP = {
  "savour foods": {
    rating: "4.8",
    prepTime: "15-20 min",
    tags: "Traditional • Pulao • Kebab",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80",
  },
  "gourmet restaurant": {
    rating: "4.6",
    prepTime: "20-25 min",
    tags: "Fast Food • Traditional • Cakes",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80",
  },
  "johnny & jugnu": {
    rating: "4.7",
    prepTime: "25-30 min",
    tags: "Fast Food • Wehshi Burgers • Fries",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
  },
  "dogar restaurant": {
    rating: "4.5",
    prepTime: "10-15 min",
    tags: "Traditional • Biryani • Chai",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
  }
};

const getCanteenDisplayInfo = (res) => {
  const nameLower = (res.name || "").toLowerCase();
  const meta = METADATA_MAP[nameLower] || {
    rating: "4.5",
    prepTime: "15-25 min",
    tags: "Campus Favorite",
    image: res.coverImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80",
  };
  return {
    name: res.name,
    rating: meta.rating,
    prepTime: meta.prepTime,
    tags: meta.tags,
    image: res.coverImage || meta.image,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
          Popular Canteens
        </h3>
        <span className="text-[10px] font-black text-slate-400">
          {displayRestaurants.length} Locations Nearby
        </span>
      </div>

      {/* Grid Layout of Dynamic Canteens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayRestaurants.map((res, index) => {
          const backendId = res._id || res.id;
          const isSelected = activeRestaurant === backendId;
          const displayInfo = getCanteenDisplayInfo(res);

          return (
            <button
              key={backendId}
              onClick={() => {
                setActiveRestaurant(backendId);
                setSelectedVisualIndex(index);
                setSelectedCategory("All");
              }}
              className={`flex flex-col overflow-hidden rounded-3xl border text-left transition-all duration-300 w-full hover:-translate-y-1 ${
                isSelected
                  ? "border-[#e87a5d] shadow-[0_12px_24px_rgba(232,122,93,0.08)] bg-[#fff5f2]/40"
                  : "border-slate-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)]"
              }`}
            >
              {/* Image Container with Rating Badge */}
              <div className="h-32 w-full overflow-hidden relative shrink-0">
                <img
                  src={displayInfo.image}
                  alt={displayInfo.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-0.5 text-[10px] font-extrabold text-[#0a2342] shadow-sm">
                  <span className="text-amber-500">★</span>
                  <span>{displayInfo.rating}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col gap-1 flex-1">
                <h4 className="text-xs font-black text-[#0a2342] truncate leading-tight">
                  {displayInfo.name}
                </h4>
                
                <p className="text-[9.5px] font-semibold text-slate-400 truncate">
                  {displayInfo.tags}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[9.5px] font-black text-slate-500">
                    🛵 {displayInfo.prepTime}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider ${
                    displayInfo.status === "Open" 
                      ? "bg-emerald-50 border-emerald-100/50 text-emerald-600" 
                      : "bg-rose-50 border-rose-100/50 text-rose-600"
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