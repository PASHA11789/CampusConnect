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
          <h2 className="text-lg font-black text-[#0a2342]">Nearby Restaurants</h2>
          <p className="text-xs font-semibold text-slate-400">Within campus range</p>
        </div>
        <span className="rounded-full bg-[#e2725b]/10 px-3 py-1 text-[10px] font-black text-[#e2725b]">
          Open Now
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {restaurants.map((res) => (
          <button
            key={res.id}
            onClick={() => {
              setActiveRestaurant(res.id);
              setSelectedCategory("All");
            }}
            className={`min-w-[210px] overflow-hidden rounded-3xl border bg-white text-left transition hover:-translate-y-1 hover:shadow-md ${activeRestaurant === res.id
                ? "border-[#e2725b] shadow-md"
                : "border-slate-100"
              }`}
          >
            <img src={res.image} alt={res.name} className="h-28 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-sm font-black text-[#0a2342]">{res.name}</h3>
              <p className="text-[11px] font-semibold text-slate-400">
                {res.cuisine} • {res.distance}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs font-black text-amber-500">⭐ {res.rating}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">
                  {res.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}