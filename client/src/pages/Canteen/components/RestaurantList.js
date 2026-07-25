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
  },
  "cafe aroma (library)": {
    rating: "4.9",
    prepTime: "5-10 min",
    tags: "Coffee • Sandwiches • Muffins",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
  },
  "spice junction (cs block)": {
    rating: "4.7",
    prepTime: "15-20 min",
    tags: "Fast Food • Zingers • Rolls",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&q=80",
  },
  "student food hub": {
    rating: "4.6",
    prepTime: "15-25 min",
    tags: "Desi • Karahi • Naan • Paratha",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80",
  },
  "sweet & scoop cafe": {
    rating: "4.8",
    prepTime: "5-12 min",
    tags: "Ice Cream • Shakes • Desserts",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80",
  },
  "howdy burgers": {
    rating: "4.8",
    prepTime: "20-25 min",
    tags: "Charcoal Burgers • Steaks • Fries",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
  },
  "kfc express (campus)": {
    rating: "4.7",
    prepTime: "15-20 min",
    tags: "Zinger • Hot Wings • Buckets",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
  },
  "cheezious pizza": {
    rating: "4.9",
    prepTime: "25-30 min",
    tags: "Crown Crust • Pizza • Pasta",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&q=80",
  },
  "tezgaah chai & snacks": {
    rating: "4.6",
    prepTime: "10-12 min",
    tags: "Matka Chai • Paratha • Samosa",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80",
  },
  "subway campus corner": {
    rating: "4.7",
    prepTime: "10-15 min",
    tags: "6-inch Sub • Footlong • Cookies",
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&q=80",
  },
  "bar b q tonight grill": {
    rating: "4.8",
    prepTime: "20-30 min",
    tags: "Seekh Kabab • Chicken Tikka • Naan",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
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
      {/* Header with Step Indicator */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e87a5d] text-white text-[11px] font-black shadow-sm">
            1
          </span>
          <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
            Select a Campus Canteen
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200/70 shadow-2xs">
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
              className={`group flex flex-col overflow-hidden rounded-3xl border text-left transition-all duration-300 w-full relative cursor-pointer ${
                isSelected
                  ? "border-[#e87a5d] ring-4 ring-[#e87a5d]/20 shadow-xl bg-gradient-to-b from-[#fff7f5] to-white scale-[1.02]"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-300"
              }`}
            >
              {/* Active Glow Ribbon */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e87a5d] via-orange-400 to-[#e87a5d] z-20" />
              )}

              {/* Image Container with Rating & Status Badge */}
              <div className="h-36 w-full overflow-hidden relative shrink-0">
                <img
                  src={displayInfo.image}
                  alt={displayInfo.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-[10.5px] font-extrabold text-[#0a2342] shadow-md">
                  <span className="text-amber-500">★</span>
                  <span>{displayInfo.rating}</span>
                </div>

                {/* Selection Badge overlay */}
                {isSelected && (
                  <div className="absolute top-3 left-3 bg-[#e87a5d] text-white text-[9.5px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                    ✓ Active Selection
                  </div>
                )}
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-[#0a2342] truncate leading-tight group-hover:text-[#e87a5d] transition-colors">
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