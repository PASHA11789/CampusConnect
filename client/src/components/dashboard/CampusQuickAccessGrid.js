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
    },
    {
      id: "forums",
      title: "STUDENT FORUMS",
      subtitle: "Engage, ask & share with fellow classmates",
      icon: "💬",
      buttonText: "View Forums →",
      path: "/forum",
    },
    {
      id: "petitions",
      title: "ACTIVE PETITIONS",
      subtitle: "Initiate or support campus improvement actions",
      icon: "📣",
      buttonText: "View Petitions →",
      path: "/petitions",
    },
    {
      id: "lostfound",
      title: "LOST & FOUND HUB",
      subtitle: "Track or report campus items",
      icon: "🎒",
      buttonText: "View Hub →",
      path: "/lost-found",
    },
    {
      id: "busroutes",
      title: "BUS ROUTES",
      subtitle: "Find routes & timings around the campus",
      icon: "🚌",
      buttonText: "View Routes →",
      path: "/bus-routes",
    },
    {
      id: "career",
      title: "CAREER & ALUMNI HUB",
      subtitle: "Jobs, internships & alumni connections",
      icon: "💼",
      buttonText: "Explore Hub →",
      path: "/career",
    }
  ];

  return (
    <div className="w-full flex flex-col gap-3.5 my-1">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-[#071A35] uppercase tracking-wider flex items-center gap-1.5 m-0">
          <span>Campus Quick Services</span>
          <span className="text-amber-500">⚡</span>
        </h3>
        <span className="text-[10.5px] font-extrabold text-slate-400">6 Modules</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-start">
        {widgets.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full max-w-[480px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-[#00c2cb]/50 transition-all duration-300 flex flex-col justify-between gap-3.5 cursor-pointer text-left group"
          >
            <div className="flex flex-col gap-2 min-w-0">
              {/* Header with Icon Circle */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-105 transition-all duration-300 bg-slate-50 border border-slate-100 group-hover:bg-[#00c2cb]/10 group-hover:border-[#00c2cb]/20">
                  {item.icon}
                </div>
                <h4 className="text-[13px] font-black text-[#071A35] tracking-tight m-0 leading-snug truncate group-hover:text-[#00c2cb] transition-colors">
                  {item.title}
                </h4>
              </div>

              {/* Subtitle Description */}
              <p className="text-[11.5px] font-semibold text-slate-500 leading-relaxed m-0 pl-0.5 group-hover:text-slate-700 transition-colors">
                {item.subtitle}
              </p>
            </div>

            {/* Action Pill Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(item.path);
              }}
              className="w-full py-2 px-4 rounded-xl text-[11.5px] font-black tracking-wide transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-xs bg-[#071A35] text-white hover:bg-[#00c2cb] group-hover:shadow-md"
            >
              {item.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
