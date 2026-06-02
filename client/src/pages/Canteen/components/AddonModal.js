import React from "react";

export default function AddonModal({
  customizingItem,
  setCustomizingItem,
  customizations,
  setCustomizations,
  handleConfirmCustomization,
}) {
  if (!customizingItem) return null;

  return (
    <div className="fixed inset-0 bg-[#0a2342]/45 backdrop-blur-[6px] flex items-end sm:items-center justify-center z-[2100] animate-modal-fade-in">
      <div className="w-full sm:w-[90%] sm:max-w-[440px] bg-white sm:rounded-3xl rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 animate-modal-slide-in">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <span className="bg-[#00c2cb]/10 text-[#00c2cb] text-[9.5px] font-extrabold tracking-wider px-2 py-0.5 rounded uppercase">
              {customizingItem.category}
            </span>
            <h3 className="text-[15px] font-black text-[#0a2342] tracking-tight mt-1">
              Customize Your Meal
            </h3>
          </div>
          <button
            className="bg-none border-none text-[22px] leading-none text-slate-400 cursor-pointer flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-slate-100 hover:text-red-500 focus:outline-none"
            onClick={() => setCustomizingItem(null)}
          >
            ×
          </button>
        </div>

        {/* Item Preview */}
        <div className="flex gap-3 items-center bg-slate-50 p-2.5 rounded-2xl">
          <img
            src={customizingItem.image}
            alt={customizingItem.name}
            className="w-12 h-12 rounded-xl object-cover shadow-sm"
          />
          <div>
            <h4 className="text-[13px] font-black text-[#0a2342]">{customizingItem.name}</h4>
            <span className="text-[11.5px] text-[#00c2cb] font-extrabold">
              Base Price: Rs. {customizingItem.price}
            </span>
          </div>
        </div>

        {/* Fast Food Options */}
        {customizingItem.category === "Fast Food" && (
          <div className="flex flex-col gap-3 mt-1">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Choose Addons
              </span>
              <div className="flex flex-col gap-2 mt-1.5">
                <label className="flex items-center justify-between text-[11.5px] font-bold text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-[#00c2cb]/30 transition-colors">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customizations.extraCheese}
                      onChange={(e) =>
                        setCustomizations({ ...customizations, extraCheese: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#00c2cb]"
                    />
                    🧀 Extra Cheese
                  </span>
                  <span className="text-emerald-600 font-extrabold">+Rs. 40</span>
                </label>
                <label className="flex items-center justify-between text-[11.5px] font-bold text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-[#00c2cb]/30 transition-colors">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customizations.makeCombo}
                      onChange={(e) =>
                        setCustomizations({ ...customizations, makeCombo: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#00c2cb]"
                    />
                    🍟 Make it a Combo (Fries + Drink)
                  </span>
                  <span className="text-emerald-600 font-extrabold">+Rs. 150</span>
                </label>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Select Spice Level
              </span>
              <div className="flex gap-2 mt-1.5 bg-slate-100 p-1 rounded-xl">
                {["Mild", "Medium", "Spicy"].map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setCustomizations({ ...customizations, spiceLevel: sp })}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all border-none ${
                      customizations.spiceLevel === sp
                        ? "bg-white text-[#0a2342] shadow-sm"
                        : "text-slate-500 bg-transparent"
                    }`}
                  >
                    {sp === "Mild" ? "🌿" : sp === "Medium" ? "🌶️" : "🔥"} {sp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Traditional Options */}
        {customizingItem.category === "Traditional" && (
          <div className="flex flex-col gap-3 mt-1">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Choose Addons
              </span>
              <div className="flex flex-col gap-2 mt-1.5">
                <label className="flex items-center justify-between text-[11.5px] font-bold text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-[#00c2cb]/30 transition-colors">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customizations.extraShami}
                      onChange={(e) =>
                        setCustomizations({ ...customizations, extraShami: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#00c2cb]"
                    />
                    🍢 Extra Shami Kabab
                  </span>
                  <span className="text-emerald-600 font-extrabold">+Rs. 70</span>
                </label>
                <label className="flex items-center justify-between text-[11.5px] font-bold text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:border-[#00c2cb]/30 transition-colors">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customizations.extraRaita}
                      onChange={(e) =>
                        setCustomizations({ ...customizations, extraRaita: e.target.checked })
                      }
                      className="w-4 h-4 rounded accent-[#00c2cb]"
                    />
                    🥛 Extra Raita / Salad
                  </span>
                  <span className="text-emerald-600 font-extrabold">+Rs. 30</span>
                </label>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Portion Size
              </span>
              <div className="flex gap-2 mt-1.5 bg-slate-100 p-1 rounded-xl">
                {["Regular", "Double"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setCustomizations({ ...customizations, portionSize: sz })}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all border-none ${
                      customizations.portionSize === sz
                        ? "bg-white text-[#0a2342] shadow-sm"
                        : "text-slate-500 bg-transparent"
                    }`}
                  >
                    {sz} {sz === "Double" && "(+Rs.100)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-3.5 mt-1">
          <button
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 border-none py-2 px-4 rounded-xl text-[12px] font-bold cursor-pointer transition-colors focus:outline-none"
            onClick={() => setCustomizingItem(null)}
          >
            Cancel
          </button>
          <button
            className="bg-[#00c2cb] hover:bg-[#00b2bb] text-white border-none py-2 px-5 rounded-xl text-[12px] font-bold cursor-pointer transition-all shadow-sm focus:outline-none"
            onClick={handleConfirmCustomization}
          >
            Add to Cart 🛒
          </button>
        </div>
      </div>
    </div>
  );
}
