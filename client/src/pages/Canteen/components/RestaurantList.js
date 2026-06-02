import React, { useRef } from "react";

export default function RestaurantList({ restaurants, activeRestaurant, setActiveRestaurant, setSelectedCategory }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="shrink-0">
      <div className="flex justify-between items-center mb-3">
        <h3
          id="select-restaurant-heading"
          className="text-[13px] font-extrabold text-[#0a2342] tracking-wide uppercase"
        >
          Select Restaurant or Cafeteria
        </h3>
        <button className="text-[11.5px] font-extrabold text-[#00c2cb] hover:underline cursor-pointer bg-transparent border-none focus:outline-none">
          View All →
        </button>
      </div>

      <div className="relative group w-full">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => handleScroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 text-slate-600 hover:text-[#00c2cb] hover:border-[#00c2cb] focus:outline-none opacity-0 group-hover:opacity-100 duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 pr-1 scrollbar-none scroll-smooth"
        >
          {restaurants.map((res) => (
            <div
              key={res.id}
              onClick={() => {
                setActiveRestaurant(res.id);
                setSelectedCategory("All");
              }}
              className={`flex-shrink-0 w-[190px] bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group/card card-premium ${
                activeRestaurant === res.id
                  ? "border-[#00c2cb] ring-4 ring-[#00c2cb]/10 shadow-sm"
                  : "border-slate-100"
              }`}
            >
              <div className="relative h-[95px] overflow-hidden">
                <img
                  src={res.image}
                  alt={res.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
                <span className="absolute top-2 left-2 bg-[#00c2cb] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {res.distance}
                </span>
                {activeRestaurant === res.id && (
                  <span className="absolute top-2 right-2 bg-white text-[#00c2cb] text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                    ✓ Selected
                  </span>
                )}
              </div>
              <div className="p-3 flex flex-col gap-1">
                <h4 className="text-[12.5px] font-black text-[#0a2342] m-0 truncate">{res.name}</h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                  <span className="text-[#fbbf24]">★</span>
                  <span className="text-slate-600">{res.rating}</span>
                  <span>•</span>
                  <span>{res.cuisine}</span>
                </div>
                <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-50">
                  <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Open
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => handleScroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 text-slate-600 hover:text-[#00c2cb] hover:border-[#00c2cb] focus:outline-none opacity-0 group-hover:opacity-100 duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
