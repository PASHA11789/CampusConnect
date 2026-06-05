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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0a2342]">Customize Meal</h2>
            <p className="text-xs font-semibold text-slate-400">{customizingItem.name}</p>
          </div>
          <button
            onClick={() => setCustomizingItem(null)}
            className="h-9 w-9 rounded-full bg-slate-100 text-xl font-black"
          >
            ×
          </button>
        </div>

        <div className="mt-5 grid grid-cols-[220px_1fr] gap-5 max-md:grid-cols-1">
          <div className="rounded-3xl bg-[#fff7f2] p-4 text-center">
            <img
              src={customizingItem.image}
              alt={customizingItem.name}
              className="h-40 w-full rounded-2xl object-cover"
            />
            <h3 className="mt-3 text-sm font-black text-[#0a2342]">{customizingItem.name}</h3>
            <p className="text-sm font-black text-[#e2725b]">Rs. {customizingItem.price}</p>
          </div>

          <div className="space-y-4">
            {isFastFood ? (
              <>
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-sm font-bold">
                  Extra Cheese <input type="checkbox" checked={customizations.extraCheese} onChange={(e) => update("extraCheese", e.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-sm font-bold">
                  Make Combo <input type="checkbox" checked={customizations.makeCombo} onChange={(e) => update("makeCombo", e.target.checked)} />
                </label>

                <div>
                  <h4 className="mb-2 text-xs font-black uppercase text-[#0a2342]">Spice Level</h4>
                  <div className="flex gap-2">
                    {["Mild", "Medium", "Hot"].map((level) => (
                      <button
                        key={level}
                        onClick={() => update("spiceLevel", level)}
                        className={`rounded-xl px-4 py-2 text-xs font-black ${customizations.spiceLevel === level
                          ? "bg-[#e2725b] text-white"
                          : "bg-[#fff7f2] text-[#0a2342]"
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
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-sm font-bold">
                  Extra Shami <input type="checkbox" checked={customizations.extraShami} onChange={(e) => update("extraShami", e.target.checked)} />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 text-sm font-bold">
                  Extra Raita <input type="checkbox" checked={customizations.extraRaita} onChange={(e) => update("extraRaita", e.target.checked)} />
                </label>

                <div>
                  <h4 className="mb-2 text-xs font-black uppercase text-[#0a2342]">Portion Size</h4>
                  <div className="flex gap-2">
                    {["Regular", "Double"].map((size) => (
                      <button
                        key={size}
                        onClick={() => update("portionSize", size)}
                        className={`rounded-xl px-4 py-2 text-xs font-black ${customizations.portionSize === size
                          ? "bg-[#e2725b] text-white"
                          : "bg-[#fff7f2] text-[#0a2342]"
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

        <button
          onClick={handleConfirmCustomization}
          className="mt-6 w-full rounded-2xl bg-[#0a2342] py-4 text-sm font-black text-white hover:bg-[#e2725b]"
        >
          Add Customized Item
        </button>
      </div>
    </div>
  );
}