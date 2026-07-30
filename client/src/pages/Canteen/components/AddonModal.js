import React from "react";

export default function AddonModal({
  customizingItem,
  setCustomizingItem,
  customizations,
  setCustomizations,
  handleConfirmCustomization,
}) {
  if (!customizingItem) return null;

  const isFastFood = customizingItem.category === "Fast Food";

  const update = (key, value) => {
    setCustomizations((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#071A35]/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl sm:max-w-2xl rounded-3xl sm:rounded-[32px] bg-white p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col justify-between my-auto">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0a2342]">Customize Meal</h2>
              <p className="text-xs font-semibold text-slate-400">{customizingItem.name}</p>
            </div>
            <button
              onClick={() => setCustomizingItem(null)}
              className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 text-xl font-bold flex items-center justify-center transition-colors cursor-pointer border-none"
            >
              ×
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 sm:gap-6">
            <div className="rounded-2xl sm:rounded-3xl bg-[#00c2cb]/5 border border-[#00c2cb]/20 p-4 text-center flex flex-col items-center justify-center">
              <img
                src={customizingItem.image}
                alt={customizingItem.name}
                className="h-32 sm:h-36 w-full rounded-xl sm:rounded-2xl object-cover shadow-xs"
              />
              <h3 className="mt-3 text-xs sm:text-sm font-black text-[#0a2342] leading-tight">{customizingItem.name}</h3>
              <p className="text-xs sm:text-sm font-black text-[#0079c2] mt-1">Rs. {customizingItem.price}</p>
            </div>

            <div className="space-y-3.5">
              {isFastFood ? (
                <>
                  <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs sm:text-sm font-bold text-[#0a2342] cursor-pointer hover:bg-slate-50 transition-colors">
                    <span>Extra Cheese (+Rs. 60)</span>
                    <input
                      type="checkbox"
                      checked={!!customizations.extraCheese}
                      onChange={(e) => update("extraCheese", e.target.checked)}
                      className="w-4 h-4 accent-[#00c2cb] rounded cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs sm:text-sm font-bold text-[#0a2342] cursor-pointer hover:bg-slate-50 transition-colors">
                    <span>Make Combo (+Rs. 120)</span>
                    <input
                      type="checkbox"
                      checked={!!customizations.makeCombo}
                      onChange={(e) => update("makeCombo", e.target.checked)}
                      className="w-4 h-4 accent-[#00c2cb] rounded cursor-pointer"
                    />
                  </label>

                  <div>
                    <h4 className="mb-2 text-[11px] font-black uppercase text-[#0a2342] tracking-wider">Spice Level</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Mild", "Medium", "Hot"].map((level) => (
                        <button
                          key={level}
                          onClick={() => update("spiceLevel", level)}
                          className={`rounded-xl px-4 py-2 text-xs font-black cursor-pointer transition-all border ${customizations.spiceLevel === level
                            ? "bg-[#071A35] border-[#071A35] text-[#00c2cb] shadow-sm"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs sm:text-sm font-bold text-[#0a2342] cursor-pointer hover:bg-slate-50 transition-colors">
                    <span>Extra Shami (+Rs. 50)</span>
                    <input
                      type="checkbox"
                      checked={!!customizations.extraShami}
                      onChange={(e) => update("extraShami", e.target.checked)}
                      className="w-4 h-4 accent-[#071A35] rounded cursor-pointer"
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs sm:text-sm font-bold text-[#0a2342] cursor-pointer hover:bg-slate-50 transition-colors">
                    <span>Extra Raita (+Rs. 30)</span>
                    <input
                      type="checkbox"
                      checked={!!customizations.extraRaita}
                      onChange={(e) => update("extraRaita", e.target.checked)}
                      className="w-4 h-4 accent-[#071A35] rounded cursor-pointer"
                    />
                  </label>

                  <div>
                    <h4 className="mb-2 text-[11px] font-black uppercase text-[#0a2342] tracking-wider">Portion Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Regular", "Double"].map((size) => (
                        <button
                          key={size}
                          onClick={() => update("portionSize", size)}
                          className={`rounded-xl px-4 py-2 text-xs font-black cursor-pointer transition-all border ${customizations.portionSize === size
                            ? "bg-[#071A35] border-[#071A35] text-[#00c2cb] shadow-sm"
                            : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirmCustomization}
          className="mt-6 w-full rounded-2xl bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all border-none active:scale-[0.99]"
        >
          Add Customized Item
        </button>
      </div>
    </div>
  );
}