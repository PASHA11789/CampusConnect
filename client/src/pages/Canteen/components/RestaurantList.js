import React from "react";

const POPULAR_CANTEENS = [
  {
    name: "Savour Foods",
    rating: "4.8",
    prepTime: "15-20 min",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80",
    tags: "Traditional • Pulao • Kebab",
    address: "Township Sector C, Lahore (2.8 km from MUL)",
    status: "Open"
  },
  {
    name: "Gourmet Restaurant",
    rating: "4.6",
    prepTime: "20-25 min",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80",
    tags: "Fast Food • Traditional • Cakes",
    address: "Main Boulevard Township, Lahore (1.5 km from MUL)",
    status: "Open"
  },
  {
    name: "Johnny & Jugnu",
    rating: "4.7",
    prepTime: "25-30 min",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80",
    tags: "Fast Food • Wehshi Burgers • Fries",
    address: "Johar Town, Lahore (4.2 km from MUL)",
    status: "Open"
  },
  {
    name: "Dogar Restaurant",
    rating: "4.5",
    prepTime: "10-15 min",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
    tags: "Traditional • Biryani • Chai",
    address: "Main Market Township, Lahore (1.2 km from MUL)",
    status: "Open"
  }
];

export default function RestaurantList({
  restaurants,
  activeRestaurant,
  setActiveRestaurant,
  setSelectedCategory,
  selectedVisualIndex,
  setSelectedVisualIndex,
}) {
  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
          Popular Canteens
        </h3>
        <span className="text-[10px] font-black text-slate-400">
          4 Locations Nearby
        </span>
      </div>

      {/* Grid Layout of 4 Popular Canteens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {POPULAR_CANTEENS.map((canteen, index) => {
          // Map to backend restaurant ID if available
          let backendId = "";
          if (restaurants && restaurants.length > 0) {
            const res = restaurants[index % restaurants.length];
            backendId = res._id || res.id;
          }

          const isSelected = selectedVisualIndex === index;

          return (
            <button
              key={index}
              onClick={() => {
                if (backendId) {
                  setActiveRestaurant(backendId);
                }
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
                  src={canteen.image}
                  alt={canteen.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-0.5 text-[10px] font-extrabold text-[#0a2342] shadow-sm">
                  <span className="text-amber-500">★</span>
                  <span>{canteen.rating}</span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex flex-col gap-1 flex-1">
                <h4 className="text-xs font-black text-[#0a2342] truncate leading-tight">
                  {canteen.name}
                </h4>
                
                <p className="text-[9.5px] font-semibold text-slate-400 truncate">
                  {canteen.tags}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[9.5px] font-black text-slate-500">
                    🛵 {canteen.prepTime}
                  </span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 text-[8.5px] font-extrabold text-emerald-600 uppercase tracking-wider">
                    {canteen.status}
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
export { POPULAR_CANTEENS };