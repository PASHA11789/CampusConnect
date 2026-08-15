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
  setSelectedVisualIndex = () => { },
  cart = [],
  handleAdjustQty = () => { },
}) {
  // Get currently selected restaurant name
  const activeResObj = restaurants && restaurants.find(r => (r._id || r.id) === activeRestaurant);
  const selectedCanteenName = activeResObj?.name || (restaurants && restaurants[selectedVisualIndex]?.name) || "Campus Canteen";

  return (
    <div id="canteen-menu-section" className="flex flex-col gap-8 scroll-mt-6 w-full min-w-0 max-w-[640px]">
      {/* ── EXPLORE BY CATEGORY ── */}
      <div className="flex flex-col gap-4 overflow-hidden relative">
        <style>
          {`
            @keyframes autoScrollMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: autoScrollMarquee 25s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}
        </style>
        <h3 className="text-[13px] font-black text-[#0a2342] tracking-wide uppercase">
          Explore by Category
        </h3>
        
        <div className="flex items-center gap-2 w-full">
          {/* Stationary 'All' Category */}
          {categories.length > 0 && (
            <button
              onClick={() => setSelectedCategory(categories[0].name)}
              className={`h-10 rounded-full px-5 text-xs font-extrabold tracking-wide transition-all duration-300 border whitespace-nowrap focus:outline-none cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg shrink-0 z-10 ${selectedCategory === categories[0].name
                ? "bg-[#071A35] border-[#071A35] text-white shadow-md shadow-[#071A35]/20"
                : "bg-white border-slate-200 text-slate-700 hover:text-[#071A35] hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              <i className={`${categories[0].iconClass || "fa-solid fa-utensils"} text-xs`} />
              <span>{categories[0].name}</span>
            </button>
          )}

          {/* Auto-scroll Slider for the Rest */}
          <div className="relative flex-1 overflow-hidden pb-2 pt-2 -mt-2 -mb-2">
            <div className="marquee-track gap-2.5 px-2">
              {[...categories.slice(1), ...categories.slice(1), ...categories.slice(1), ...categories.slice(1)].map((cat, idx) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <button
                    key={`${cat.name}-${idx}`}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`h-10 rounded-full px-5 text-xs font-extrabold tracking-wide transition-all duration-300 border whitespace-nowrap focus:outline-none cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg shrink-0 ${isSelected
                      ? "bg-[#071A35] border-[#071A35] text-white shadow-md shadow-[#071A35]/20"
                      : "bg-white border-slate-200 text-slate-700 hover:text-[#071A35] hover:bg-slate-50 hover:border-slate-300"
                      }`}
                  >
                    <i className={`${cat.iconClass || "fa-solid fa-utensils"} text-xs`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── SELECTED RESTAURANT MENU (DISH LIST) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2 items-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#071A35] to-[#0079c2] text-white text-[11px] font-black shadow-xs">
              2
            </span>
            <h3 className="text-sm font-black text-[#0a2342] tracking-wide uppercase">
              {selectedCanteenName}'s Menu
            </h3>
            <span className="bg-[#00c2cb]/10 border border-[#00c2cb]/30 text-[#0079c2] text-[9.5px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              {selectedCategory}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
            {filteredMenu.length} {filteredMenu.length === 1 ? "Item" : "Items"} Available
          </span>
        </div>

        {/* Grid Layout for Dishes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-[640px]">
          {filteredMenu.length > 0 ? (
            filteredMenu.map((item) => {
              const itemId = item._id || item.id;
              const itemImage = item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
              const itemDesc = item.description || item.desc || "Delicious campus meal";

              // Determine spice level dynamically
              const isSpicy = item.name.toLowerCase().match(/(biryani|zinger|spicy|tikka|kabab|karahi|shami|chilli)/);

              // Check if in cart
              const cartItem = cart.find((ci) => ci._id === itemId || ci.id === itemId || ci.name === item.name);

              const isUnavailable = item.isAvailable === false || item.isAvailable === "false" || item.isAvailable === 0 || item.status === "Inactive" || item.status === "Unavailable" || item.status === "Out of Stock";

              return (
                <div
                  key={itemId}
                  onClick={() => {
                    if (isUnavailable) {
                      handleAddToCartClick(item);
                    }
                  }}
                  className={`bg-white border rounded-[20px] p-2.5 sm:p-3 flex flex-col gap-2.5 justify-between shadow-sm transition-all duration-300 group cursor-pointer ${isUnavailable
                    ? "border-slate-200 opacity-80 bg-slate-50/50"
                    : "border-slate-200/90 hover:shadow-lg hover:-translate-y-1 hover:border-[#071A35]/30"
                    }`}
                >
                  {/* Item Image */}
                  <div className="w-full h-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 relative shadow-sm shrink-0">
                    <img
                      src={itemImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {isUnavailable ? (
                      <div className="absolute inset-0 bg-[#071A35]/70 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                          <i className="fa-solid fa-ban text-[9px]" /> Out of Stock
                        </span>
                      </div>
                    ) : cartItem ? (
                      <div className="absolute inset-0 bg-[#071A35]/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-[#00c2cb] text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                          {cartItem.qty} in cart
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[13px] sm:text-[14px] font-black text-[#0a2342] leading-tight group-hover:text-[#0079c2] transition-colors line-clamp-2 m-0">
                        {item.name}
                      </h4>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-extrabold border shrink-0 mt-0.5 ${isSpicy
                        ? "bg-red-50 border-red-100 text-red-600"
                        : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                        {isSpicy ? <i className="fa-solid fa-pepper-hot text-[9px] text-red-500" /> : <i className="fa-solid fa-leaf text-[9px] text-emerald-500" />}
                        <span>{isSpicy ? "Spicy" : "Mild"}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-snug">
                      {itemDesc}
                    </p>
                  </div>

                  {/* Price and Add Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 mt-auto">
                    <span className="text-[13px] font-black text-[#0a2342] bg-slate-50 px-2 py-1 rounded-xl border border-slate-200/60 group-hover:bg-[#071A35] group-hover:text-white transition-colors duration-300">
                      Rs. {item.price}
                    </span>

                    {isUnavailable ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCartClick(item);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 py-1.5 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer flex items-center gap-1 shrink-0 transition-colors"
                        title="Click to check item status"
                      >
                        <span>Unavailable</span>
                        <i className="fa-solid fa-ban text-[9px] text-rose-500" />
                      </button>
                    ) : cartItem ? (
                      /* Quantity adjusters inline if item is already in cart */
                      <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200/80 p-1 rounded-xl shadow-inner">
                        <button
                          onClick={() => handleAdjustQty(cartItem.id, -1)}
                          className="h-6 w-6 rounded-lg bg-white border border-slate-200 font-black text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-xs focus:outline-none shadow-sm"
                        >
                          -
                        </button>
                        <span className="text-[10px] font-black text-[#0a2342] w-4 text-center">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => handleAdjustQty(cartItem.id, 1)}
                          className="h-6 w-6 rounded-lg bg-white border border-slate-200 font-black text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-xs focus:outline-none shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      /* Vibrant Add to Cart Button */
                      <button
                        onClick={() => handleAddToCartClick(item)}
                        className="bg-[#071A35] hover:bg-[#00c2cb] text-white hover:text-slate-950 border-none py-1.5 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-md hover:shadow-xl active:scale-95 flex items-center gap-1 shrink-0"
                      >
                        <span>Add</span>
                        <i className="fa-solid fa-plus text-[9px]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-[24px] flex flex-col items-center justify-center col-span-full">
              <div className="w-14 h-14 rounded-full bg-[#00c2cb]/10 text-[#00c2cb] flex items-center justify-center text-2xl mb-2">
                <i className="fa-solid fa-utensils" />
              </div>
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
    </div>
  );
}
