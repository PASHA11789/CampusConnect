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
  selectedVisualIndex = 0,
  setSelectedVisualIndex = () => {},
  POPULAR_CANTEENS = [],
  cart = [],
  handleAdjustQty = () => {},
}) {
  // Get currently selected visual restaurant name
  const selectedCanteenName = POPULAR_CANTEENS[selectedVisualIndex]?.name || "Cafe Aroma";

  return (
    <div className="flex flex-col gap-8">
      {/* ── EXPLORE BY CATEGORY ── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
          Explore by Category
        </h3>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-200 border whitespace-nowrap focus:outline-none ${
                  isSelected
                    ? "bg-[#e87a5d] border-[#e87a5d] text-white shadow-[0_4px_12px_rgba(232,122,93,0.15)]"
                    : "bg-white border-slate-200 text-slate-500 hover:text-[#0a2342] hover:bg-slate-50"
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SELECTED RESTAURANT MENU (DISHE LIST) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
              {selectedCanteenName}'s Menu
            </h3>
            <span className="bg-[#fff5f2] border border-orange-100 text-[#e87a5d] text-[8.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {selectedCategory}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {filteredMenu.length} {filteredMenu.length === 1 ? "Item" : "Items"} Available
          </span>
        </div>

        {/* 1-Column List of Wide Horizontal Dish Rows */}
        <div className="flex flex-col gap-4">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => {
              const itemId = item._id || item.id;
              const itemImage = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
              const itemDesc = item.description || item.desc || "Delicious campus meal";
              
              // Determine spice level dynamically
              const isSpicy = item.name.toLowerCase().match(/(biryani|zinger|spicy|tikka|kabab|karahi|shami|chilli)/);
              const spiceLabel = isSpicy ? "🌶️ Spicy" : "🥬 Mild";

              // Check if in cart
              const cartItem = cart.find((ci) => ci._id === itemId || ci.id === itemId);

              return (
                <div
                  key={itemId}
                  className="bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)] transition-all duration-300 group"
                >
                  {/* Left Column: Image & Details */}
                  <div className="flex gap-4 items-center w-full sm:w-auto flex-1 min-w-0">
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative shadow-sm">
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-black text-[#0a2342] truncate leading-tight">
                          {item.name}
                        </h4>
                        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold border ${
                          isSpicy
                            ? "bg-red-50 border-red-100 text-red-600"
                            : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                          {spiceLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 sm:line-clamp-1 leading-relaxed">
                        {itemDesc}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Price and Add Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                    <span className="text-xs font-black text-[#0a2342]">
                      Rs. {item.price}
                    </span>

                    {cartItem ? (
                      /* Quantity adjusters inline if item is already in cart */
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
                        <button
                          onClick={() => handleAdjustQty(cartItem.id, -1)}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200/60 font-black text-slate-600 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-[#0a2342] w-4 text-center">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => handleAdjustQty(cartItem.id, 1)}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-200/60 font-black text-slate-600 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      /* Vibrant Green Add Button */
                      <button
                        onClick={() => handleAddToCartClick(item)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white border-none py-2 px-5 rounded-2xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors duration-200 shadow-sm focus:outline-none shrink-0"
                      >
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center">
              <span className="text-[32px] mb-2">🍽️</span>
              <h4 className="text-[13px] font-bold text-[#0a2342] mb-1">
                No items found in this category
              </h4>
              <p className="text-[11.5px] text-slate-400 font-medium">
                Try choosing a different category filter above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── POPULAR DISHES GRID (Featured Items) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
            Popular Dishes
          </h3>
          <span className="text-[10px] font-black text-[#e87a5d]">
            Top student choices
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {popularDishes.map((dish) => {
            const isFav = favorites[dish.id];
            const cartItem = cart.find(ci => ci._id === dish.id || ci.id === dish.id);

            return (
              <div
                key={dish.id}
                className="bg-white border border-slate-200/80 rounded-[24px] p-3 flex flex-col gap-3 transition-all duration-300 hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 group relative"
              >
                {/* Heart Favorite */}
                <button
                  onClick={() => toggleFavorite(dish.id)}
                  className="absolute top-4.5 right-4.5 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center border border-slate-100 cursor-pointer text-slate-400 hover:text-red-500 hover:scale-105 transition-all z-10 focus:outline-none"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-slate-400"}`}
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

                {/* Dish Image */}
                <div className="h-28 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative shrink-0">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Title & Info */}
                <div className="flex flex-col gap-1.5 mt-1 flex-1">
                  <h4 className="text-[11px] font-black text-[#0a2342] leading-tight truncate">
                    {dish.name}
                  </h4>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs font-black text-[#e87a5d]">Rs. {dish.price}</span>
                    <div className="flex items-center gap-0.5 text-[9.5px] text-slate-400 font-bold">
                      <span className="text-amber-500">★</span>
                      <span className="text-slate-600">{dish.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {cartItem ? (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/50 p-0.5 rounded-xl mt-2 w-full">
                    <button
                      onClick={() => handleAdjustQty(cartItem.id, -1)}
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200/60 font-black text-slate-600 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                    >
                      -
                    </button>
                    <span className="text-xs font-black text-[#0a2342] text-center w-6">
                      {cartItem.qty}
                    </span>
                    <button
                      onClick={() => handleAdjustQty(cartItem.id, 1)}
                      className="h-7 w-7 rounded-lg bg-white border border-slate-200/60 font-black text-slate-600 hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      let targetResId = activeRestaurant;
                      let visualIdx = selectedVisualIndex;
                      if (restaurants && restaurants.length > 0) {
                        if (dish.restaurantId === "sav") { targetResId = restaurants[0]?._id; visualIdx = 0; }
                        else if (dish.restaurantId === "gour") { targetResId = restaurants[1 % restaurants.length]?._id; visualIdx = 1; }
                        else if (dish.restaurantId === "jj") { targetResId = restaurants[2 % restaurants.length]?._id; visualIdx = 2; }
                        else if (dish.restaurantId === "dog") { targetResId = restaurants[3 % restaurants.length]?._id; visualIdx = 3; }
                      }
                      if (targetResId !== activeRestaurant) {
                        setActiveRestaurant(targetResId);
                        setSelectedVisualIndex(visualIdx);
                      }
                      handleAddToCartClick({
                        _id: dish.id,
                        name: dish.name,
                        price: dish.price,
                        category: dish.category,
                        desc: dish.desc || dish.description,
                        image: dish.image
                      });
                    }}
                    className="w-full bg-[#0a2342] hover:bg-[#e87a5d] text-white border-none py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors duration-200 mt-2 text-center shadow-sm focus:outline-none"
                  >
                    + Add to Cart
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TODAY'S DEALS ── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
          Today's Deals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {deals.map((deal) => {
            const cartItem = cart.find(ci => ci._id === deal.id || ci.id === deal.id);
            return (
              <div
                key={deal.id}
                className="bg-white border border-slate-200/80 rounded-[24px] p-4 shadow-sm flex items-center justify-between gap-4 group transition-all hover:shadow-[0_12px_24px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 relative overflow-hidden"
              >
                <span className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[8px] font-black tracking-wider px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                  {deal.tag}
                </span>
                <div className="flex flex-col gap-1.5 max-w-[60%] pt-3.5">
                  <h4 className="text-[11px] font-black text-[#0a2342] leading-tight truncate">
                    {deal.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold line-clamp-1 leading-tight">{deal.desc}</p>
                  
                  {cartItem ? (
                    <span className="text-[9.5px] font-extrabold text-[#e87a5d]">
                      In Cart ({cartItem.qty})
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        let targetResId = activeRestaurant;
                        let visualIdx = selectedVisualIndex;
                        if (restaurants && restaurants.length > 0) {
                          if (deal.restaurantId === "sav") { targetResId = restaurants[0]?._id; visualIdx = 0; }
                          else if (deal.restaurantId === "gour") { targetResId = restaurants[1 % restaurants.length]?._id; visualIdx = 1; }
                          else if (deal.restaurantId === "jj") { targetResId = restaurants[2 % restaurants.length]?._id; visualIdx = 2; }
                          else if (deal.restaurantId === "dog") { targetResId = restaurants[3 % restaurants.length]?._id; visualIdx = 3; }
                        }
                        setActiveRestaurant(targetResId);
                        setSelectedVisualIndex(visualIdx);
                        handleAddToCartClick({
                          id: deal.id,
                          name: deal.title,
                          price: deal.price,
                          category: deal.category,
                          desc: deal.desc,
                          image: deal.image
                        });
                      }}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors cursor-pointer bg-transparent border-none text-left p-0 mt-1 focus:outline-none"
                    >
                      Order Now →
                    </button>
                  )}
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
