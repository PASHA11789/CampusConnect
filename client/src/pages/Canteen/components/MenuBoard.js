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
  cart = [],
  handleAdjustQty = () => {},
}) {
  // Get currently selected restaurant name
  const activeResObj = restaurants && restaurants.find(r => (r._id || r.id) === activeRestaurant);
  const selectedCanteenName = activeResObj?.name || (restaurants && restaurants[selectedVisualIndex]?.name) || "Campus Canteen";

  return (
    <div id="canteen-menu-section" className="flex flex-col gap-8 scroll-mt-6">
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

      {/* ── SELECTED RESTAURANT MENU (DISH LIST) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex gap-2 items-center">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0a2342] text-white text-[11px] font-black shadow-sm">
              2
            </span>
            <h3 className="text-sm font-black text-[#0a2342] tracking-wide uppercase">
              {selectedCanteenName}'s Menu
            </h3>
            <span className="bg-[#fff5f2] border border-orange-200 text-[#e87a5d] text-[9.5px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
              {selectedCategory}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
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
              const cartItem = cart.find((ci) => ci._id === itemId || ci.id === itemId || ci.name === item.name);

              return (
                <div
                  key={itemId}
                  className="bg-white border border-slate-200/90 rounded-3xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group"
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
                      {cartItem && (
                        <div className="absolute inset-0 bg-[#e87a5d]/30 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="bg-[#e87a5d] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                            {cartItem.qty} in cart
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-[#0a2342] truncate leading-tight group-hover:text-[#e87a5d] transition-colors">
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
                      <p className="text-[11px] text-slate-400 font-semibold line-clamp-2 sm:line-clamp-1 leading-relaxed">
                        {itemDesc}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Price and Add Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <span className="text-sm font-black text-[#0a2342] bg-slate-50 px-3 py-1 rounded-xl border border-slate-200/60">
                      Rs. {item.price}
                    </span>

                    {cartItem ? (
                      /* Quantity adjusters inline if item is already in cart */
                      <div className="flex items-center gap-2 bg-slate-100 border border-slate-200/80 p-1.5 rounded-2xl shadow-inner">
                        <button
                          onClick={() => handleAdjustQty(cartItem.id, -1)}
                          className="h-8 w-8 rounded-xl bg-white border border-slate-200 font-black text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-[#0a2342] w-5 text-center">
                          {cartItem.qty}
                        </span>
                        <button
                          onClick={() => handleAdjustQty(cartItem.id, 1)}
                          className="h-8 w-8 rounded-xl bg-white border border-slate-200 font-black text-slate-700 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center text-xs focus:outline-none"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      /* Vibrant Add to Cart Button */
                      <button
                        onClick={() => handleAddToCartClick(item)}
                        className="bg-[#e87a5d] hover:bg-[#d5674b] text-white border-none py-2.5 px-6 rounded-2xl text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 flex items-center gap-1.5 shrink-0"
                      >
                        <span>Add</span>
                        <span>+</span>
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
    </div>
  );
}
