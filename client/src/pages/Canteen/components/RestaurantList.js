import React from "react";

export default function RestaurantList({
  restaurants,
  activeRestaurant,
  setActiveRestaurant,
  setSelectedCategory,
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#0a2342]">Nearby Eateries</h2>
          <p className="text-xs font-semibold text-slate-400">Live campus updates</p>
        </div>
        <span className="rounded-full bg-[#e2725b]/10 px-3 py-1 text-[10px] font-black text-[#e2725b]">
          Open Now
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {restaurants.map((res) => {
          const resId = res._id || res.id;
          const imageSrc = res.coverImage || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80";
          const statusText = res.isActive !== false ? "Open" : "Closed";

          return (
            <button
              key={resId}
              onClick={() => {
                setActiveRestaurant(resId);
                setSelectedCategory("All");
              }}
              className={`min-w-[210px] overflow-hidden rounded-3xl border bg-white text-left transition hover:-translate-y-1 hover:shadow-md ${activeRestaurant === resId
                ? "border-[#e2725b] shadow-md"
                : "border-slate-100"
                }`}
            >
              <img src={imageSrc} alt={res.name} className="h-28 w-full object-cover" />
              <div className="p-4">
                <h3 className="text-sm font-black text-[#0a2342]">{res.name}</h3>
                <p className="text-[11px] font-semibold text-slate-400">
                  Campus Food Hub • {res.address || "Main Campus"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500">⭐ {res.rating || "4.5"}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${res.isActive !== false ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                    {statusText}
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