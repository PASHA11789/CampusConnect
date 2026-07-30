import React from "react";
import { useNavigate } from "react-router-dom";

export default function CampusQuickAccessGrid() {
  const navigate = useNavigate();

  const widgets = [
    {
      id: "canteen",
      title: "CAMPUS CANTEEN",
      subtitle: "Delicious meals from your favorite student spots",
      icon: "🍔",
      buttonText: "View Canteen →",
      path: "/canteen",
      cardBg: "bg-[#FFF8EE] border-[#FCEBD2] hover:border-[#F8D7A8]",
      iconBg: "bg-[#F59E0B] text-white",
      buttonBg: "bg-[#FDE68A] hover:bg-[#FCD34D] text-[#92400E]"
    },
    {
      id: "eateries",
      title: "NEARBY EATERIES",
      subtitle: "Explore restaurants near the campus",
      icon: "🍕",
      buttonText: "Explore Now →",
      path: "/canteen",
      cardBg: "bg-[#FFF5ED] border-[#FDDCC6] hover:border-[#FBAF85]",
      iconBg: "bg-[#F97316] text-white",
      buttonBg: "bg-[#FFEDD5] hover:bg-[#FED7AA] text-[#9A3412]"
    },
    {
      id: "forums",
      title: "STUDENT FORUMS",
      subtitle: "Engage, ask & share with fellow classmates",
      icon: "💬",
      buttonText: "View Forums →",
      path: "/forum",
      cardBg: "bg-[#F0F7FF] border-[#D0E5FF] hover:border-[#A3CEFF]",
      iconBg: "bg-[#3B82F6] text-white",
      buttonBg: "bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E40AF]"
    },
    {
      id: "petitions",
      title: "ACTIVE PETITIONS",
      subtitle: "Initiate or support campus improvement actions",
      icon: "📣",
      buttonText: "View Petitions →",
      path: "/petitions",
      cardBg: "bg-[#FFFDF0] border-[#FEEFAD] hover:border-[#FDE047]",
      iconBg: "bg-[#EAB308] text-white",
      buttonBg: "bg-[#FEF08A] hover:bg-[#FDE047] text-[#854D0E]"
    },
    {
      id: "lostfound",
      title: "LOST & FOUND HUB",
      subtitle: "Track or report campus items",
      icon: "🎒",
      buttonText: "View Hub →",
      path: "/lost-found",
      cardBg: "bg-[#F8F5FF] border-[#E9D8FD] hover:border-[#D6BCFA]",
      iconBg: "bg-[#8B5CF6] text-white",
      buttonBg: "bg-[#DDD6FE] hover:bg-[#C4B5FD] text-[#5B21B6]"
    },
    {
      id: "busroutes",
      title: "BUS ROUTES",
      subtitle: "Find routes & timings around the campus",
      icon: "🚌",
      buttonText: "View Routes →",
      path: "/bus-routes",
      cardBg: "bg-[#F0FDF4] border-[#C6F6D5] hover:border-[#9AE6B4]",
      iconBg: "bg-[#10B981] text-white",
      buttonBg: "bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#065F46]"
    },
    {
      id: "career",
      title: "CAREER & ALUMNI HUB",
      subtitle: "Jobs, internships & alumni connections",
      icon: "💼",
      buttonText: "Explore Hub →",
      path: "/career",
      cardBg: "bg-[#F0F4FF] border-[#C7D2FE] hover:border-[#A5B4FC]",
      iconBg: "bg-[#6366F1] text-white",
      buttonBg: "bg-[#C7D2FE] hover:bg-[#A5B4FC] text-[#3730A3]"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-3.5 my-1">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-[#071A35] uppercase tracking-wider flex items-center gap-1.5 m-0">
          <span>Campus Quick Services</span>
          <span className="text-amber-500">⚡</span>
        </h3>
        <span className="text-[10.5px] font-extrabold text-slate-400">7 Modules</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 justify-items-start">
        {widgets.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full max-w-[480px] rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3.5 cursor-pointer text-left group ${item.cardBg}`}
          >
            <div className="flex flex-col gap-2 min-w-0">
              {/* Header with Icon Circle */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform ${item.iconBg}`}>
                  {item.icon}
                </div>
                <h4 className="text-[13px] font-black text-[#071A35] tracking-tight m-0 leading-snug truncate">
                  {item.title}
                </h4>
              </div>

              {/* Subtitle Description */}
              <p className="text-[11.5px] font-semibold text-slate-600 leading-relaxed m-0 pl-0.5">
                {item.subtitle}
              </p>
            </div>

            {/* Action Pill Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.path);
              }}
              className={`w-full py-2 px-4 rounded-full text-[11.5px] font-black tracking-wide transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs ${item.buttonBg}`}
            >
              {item.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
