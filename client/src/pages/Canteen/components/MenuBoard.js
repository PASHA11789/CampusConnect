import React from "react";

export default function MenuBoard({
  popularDishes,
  restaurants,
  activeRestaurant,
  filteredMenu,
  selectedCategory,
  setSelectedCategory,
  categories,
  favorites,
  toggleFavorite,
  handleAddToCartClick,
  deals,
  setActiveRestaurant,
}) {
  return (
    <div className="flex flex-col gap-6">

      {/* ── POPULAR DISHES GRID ── */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide uppercase">
            Popular Dishes
          </h3>
          <button className="text-[11.5px] font-extrabold text-[#00c2cb] hover:underline cursor-pointer bg-transparent border-none focus:outline-none">
            View All Dishes →
          </button>
        </div>

        <div className="grid grid-cols-2 min-[640px]:grid-cols-3 min-[1100px]:grid-cols-2 min-[1250px]:grid-cols-3 min-[1450px]:grid-cols-4 gap-3.5">
          {popularDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-2.5 flex flex-col gap-2 transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 group relative"
            >
              {/* Heart Favorite */}
              <button
                onClick={() => toggleFavorite(dish.id)}
                className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full shadow-sm flex items-center justify-center border-none cursor-pointer text-slate-400 hover:text-red-500 hover:scale-105 active:scale-95 transition-all z-10 focus:outline-none"
              >
                <svg
                  className={`w-4 h-4 ${favorites[dish.id] ? "fill-red-500 text-red-500" : "text-slate-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              <div className="h-[95px] w-full rounded-xl overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <h4 className="text-[12px] font-black text-[#0a2342] leading-tight truncate">{dish.name}</h4>
                <span className="text-[10px] text-[#00c2cb] font-extrabold">Rs. {dish.price}</span>
                <div className="flex items-center gap-0.5 text-[10px] text-slate-400 font-bold">
                  <span className="text-[#fbbf24]">★</span>
                  <span className="text-slate-600">{dish.rating}</span>
                  <span>({dish.reviews})</span>
                </div>
              </div>

              <button
                onClick={() => handleAddToCartClick(dish)}
                className="w-full bg-white hover:bg-[#00c2cb] text-[#00c2cb] hover:text-white border border-[#00c2cb] py-1 px-3 rounded-lg text-[11px] font-extrabold cursor-pointer transition-colors mt-auto text-center focus:outline-none"
              >
                + Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── EXPLORE BY CATEGORY ── */}
      <div>
        <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide uppercase mb-3.5">
          Explore by Category
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className="flex-shrink-0 flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer p-0 select-none group focus:outline-none"
            >
              <div
                className={`w-[60px] h-[60px] rounded-full flex items-center justify-center text-[26px] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md ${
                  selectedCategory === cat.name ? "bg-[#00c2cb] scale-105" : cat.bgColor
                }`}
              >
                <span>{cat.icon}</span>
              </div>
              <span
                className={`text-[11.5px] font-extrabold transition-colors ${
                  selectedCategory === cat.name
                    ? "text-[#00c2cb]"
                    : "text-slate-500 group-hover:text-[#00c2cb]"
                }`}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SELECTED RESTAURANT MENU ── */}
      <div>
        <div className="flex gap-2 items-center mb-3">
          <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide uppercase">
            {restaurants.find((r) => r.id === activeRestaurant)?.name}'s Menu
          </h3>
          <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            {selectedCategory} items
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-1 min-[1250px]:grid-cols-2 gap-4">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 group"
              >
                <div className="relative w-[110px] shrink-0 overflow-hidden bg-slate-50">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.popularity && (
                    <span className="absolute top-2 left-2 bg-[#fbbf24] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                      {item.popularity}
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1.5 min-w-0">
                  <h4 className="text-[13px] font-black text-[#0a2342] truncate leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="flex justify-between items-center mt-auto pt-1">
                    <span className="text-[13px] font-black text-[#00c2cb]">Rs. {item.price}</span>
                    <button
                      className="bg-[#0a2342] hover:bg-[#00c2cb] text-white border-none py-1.5 px-3.5 rounded-lg text-[10.5px] font-bold cursor-pointer transition-colors shadow-sm focus:outline-none"
                      onClick={() => handleAddToCartClick(item)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 p-10 text-center bg-white border border-dashed border-slate-200/80 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[32px] mb-2">🍽️</span>
              <h4 className="text-[13px] font-bold text-[#0a2342] mb-1">
                No items found in this category
              </h4>
              <p className="text-[11.5px] text-slate-400 font-medium">
                Try searching or choosing a different category.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── TODAY'S DEALS ── */}
      <div>
        <h3 className="text-[14px] font-extrabold text-[#0a2342] tracking-wide uppercase mb-3.5">
          Today's Deals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[768px]:grid-cols-3 min-[1100px]:grid-cols-2 min-[1400px]:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3 group transition-all hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden"
            >
              <span className="absolute top-2.5 left-2.5 bg-[#ef4444] text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase shadow-sm">
                {deal.tag}
              </span>
              <div className="flex flex-col gap-1.5 max-w-[60%] pt-2">
                <h4 className="text-[12.5px] font-black text-[#0a2342] leading-tight mt-1">
                  {deal.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">{deal.desc}</p>
                <button
                  onClick={() => {
                    setActiveRestaurant(deal.restaurantId);
                    handleAddToCartClick({
                      id: deal.id,
                      name: deal.title,
                      price: deal.price,
                      category: deal.category,
                      desc: deal.desc,
                      image: deal.image,
                    });
                  }}
                  className="text-[11px] font-extrabold text-[#ef4444] hover:underline cursor-pointer bg-transparent border-none text-left p-0 mt-1 focus:outline-none"
                >
                  Order Now →
                </button>
              </div>
              <div className="w-[70px] h-[70px] rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-50">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
        <h3 className="text-[13px] font-extrabold text-[#0a2342] tracking-wide uppercase mb-5 text-center">
          How It Works
        </h3>
        <div className="grid grid-cols-4 gap-4 text-center max-md:grid-cols-2">
          {[
            { n: 1, color: "bg-teal-50 text-teal-600", label: "Order Placed", desc: "We've received your order and details." },
            { n: 2, color: "bg-orange-50 text-orange-500", label: "Preparing", desc: "Your fresh meal is being prepared." },
            { n: 3, color: "bg-blue-50 text-blue-500", label: "Out for Delivery", desc: "Rider is bringing it to your desk." },
            { n: 4, color: "bg-emerald-50 text-emerald-600", label: "Delivered", desc: "Enjoy your delicious warm meal!" },
          ].map(({ n, color, label, desc }) => (
            <div key={n} className="flex flex-col items-center gap-2">
              <span className={`w-10 h-10 rounded-full ${color} text-[18px] flex items-center justify-center font-bold`}>
                {n}
              </span>
              <h4 className="text-[11.5px] font-bold text-[#0a2342]">{label}</h4>
              <p className="text-[9.5px] text-slate-400 font-medium leading-relaxed px-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
