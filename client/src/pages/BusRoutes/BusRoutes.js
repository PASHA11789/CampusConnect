import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Layout Components
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";

const t = (s) => s;

const ROUTES_DATA = [
  {
    id: "route-1",
    name: "Route 1",
    displayName: "Route - 1 [MUL - Qartaba Chowk - MUL]",
    color: "#EAB308", // Yellow
    bgColor: "bg-yellow-500/10",
    textColor: "text-yellow-600",
    status: "On Time",
    eta: "07:30 AM",
    busNo: "LH-7890",
    driver: {
      name: "Sagheer Ahmad",
      phone: "0301-2312584",
      avatar: "SA",
      status: "Active",
      rating: "4.9 ⭐",
      capacity: "70% Full"
    },
    stops: [
      { name: "MUL (Main Campus)", time: "07:30 AM", dist: "0 km", desc: "Administration Office" },
      { name: "PINDI STOP", time: "07:38 AM", dist: "2.1 km", desc: "Main Stop Point" },
      { name: "PECO ROAD", time: "07:44 AM", dist: "3.8 km", desc: "Industrial Area Approach" },
      { name: "KOT LAKHPAT", time: "07:50 AM", dist: "5.5 km", desc: "Crossing Station" },
      { name: "MODEL TOWN KACHEHRI", time: "07:56 AM", dist: "7.0 km", desc: "Court Crossing" },
      { name: "ITTEFAQ HOSPITAL", time: "08:02 AM", dist: "8.5 km", desc: "Medical Ward Stop" },
      { name: "NASEER ABBAD", time: "08:08 AM", dist: "10.2 km", desc: "Naseer Abbad Chowk" },
      { name: "MODEL TOWN", time: "08:14 AM", dist: "11.8 km", desc: "Commercial Market" },
      { name: "KALMA CHOWK", time: "08:20 AM", dist: "13.5 km", desc: "Underpass Metro Link" },
      { name: "QADAFI STADIUM", time: "08:25 AM", dist: "15.0 km", desc: "Sports Complex Gate" },
      { name: "MUSLIM TOWN (CANAL BRIDGE)", time: "08:31 AM", dist: "16.8 km", desc: "Canal Bridge Point" },
      { name: "WAHDAT ROAD", time: "08:37 AM", dist: "18.2 km", desc: "Wahdat Road Intersection" },
      { name: "ICHRA", time: "08:43 AM", dist: "19.9 km", desc: "Ichra Bazaar Stop" },
      { name: "SHAMA STATION", time: "08:49 AM", dist: "21.5 km", desc: "Metro Station Stop" },
      { name: "QARTABA CHOWK", time: "08:55 AM", dist: "23.0 km", desc: "Final Terminal Stop" }
    ],
    path: "M 20 80 Q 60 40 100 80 T 180 80"
  }
];

export default function BusRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [isUploading] = useState(false);
  const [time, setTime] = useState(new Date());

  // Page States
  const [selectedRouteId, setSelectedRouteId] = useState("route-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  // Authenticate user & start clock
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        if (parsedUser.avatar) {
          setAvatar(parsedUser.avatar);
        }
      } catch (e) { }
    }

    const fetchUserProfile = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("/api/auth/profile", config);
        setUser(data);
        if (data.avatar) {
          setAvatar(data.avatar);
        }
        sessionStorage.setItem("user", JSON.stringify(data));
      } catch (error) {
        console.error("Failed to fetch latest user profile:", error);
      }
    };
    fetchUserProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  // Handle searching stops
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResult([]);
      return;
    }

    const matched = [];
    ROUTES_DATA.forEach((route) => {
      route.stops.forEach((stop) => {
        if (stop.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          matched.push({
            stopName: stop.name,
            routeName: route.displayName,
            routeId: route.id,
            time: stop.time,
            color: route.color
          });
        }
      });
    });
    setSearchResult(matched);
  }, [searchQuery]);

  const activeRoute = ROUTES_DATA.find((r) => r.id === selectedRouteId) || ROUTES_DATA[0];

  const getPersonalizedAvatar = (url) => {
    if (!url) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    if (url.includes("name=User")) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`;
    }
    return url;
  };

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Topbar
          time={time}
          user={user}
          setUser={setUser}
          avatar={getPersonalizedAvatar(avatar)}
          handleAvatarChange={null} // Disable header edits here, handled in modal
          isUploading={isUploading}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">
          {/* Header Section */}
          <div className="flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-4">
            <div className="flex flex-col">
              <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">{t("Bus Routes & Live Map")}</h1>
              <p className="text-[12px] text-slate-500 mt-1 font-semibold">{t("Track campus shuttle services, timelines, and live status")}</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2.5fr] gap-6 max-[1100px]:grid-cols-1 items-start">
            {/* Left Column: Route Selector & Search */}
            <div className="flex flex-col gap-5">
              {/* Search Stop Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.02)]">
                <h3 className="text-[13px] font-black text-[#0a2342] mb-3 uppercase tracking-wide">{t("Find Your Stop")}</h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stop name (e.g. Akbar Chowk)..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-[12.5px] font-semibold rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/10 transition-all placeholder:text-slate-400"
                  />
                  <span className="absolute left-3.5 top-3.5 text-slate-400 text-[14px]">🔍</span>
                </div>

                {/* Search Results list */}
                {searchQuery && (
                  <div className="mt-3 bg-slate-50 rounded-xl p-2 border border-slate-100 max-h-[180px] overflow-y-auto flex flex-col gap-1.5 custom-scrollbar">
                    {searchResult.length > 0 ? (
                      searchResult.map((res, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setSelectedRouteId(res.routeId);
                            setSearchQuery("");
                          }}
                          className="p-2.5 rounded-lg bg-white border border-slate-100 hover:border-[#00c2cb] cursor-pointer transition-all duration-200 flex justify-between items-center"
                        >
                          <div className="flex flex-col text-left">
                            <span className="text-[12px] font-bold text-slate-700">{res.stopName}</span>
                            <span className="text-[9px] font-extrabold tracking-wide uppercase mt-0.5" style={{ color: res.color }}>
                              {res.routeName}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-slate-400">{res.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 font-bold text-[11px]">{t("No matching stops found")}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Shuttle Routes Listing */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.02)] flex flex-col gap-3">
                <h3 className="text-[13px] font-black text-[#0a2342] mb-1 uppercase tracking-wide">{t("Select Route")}</h3>

                <div className="flex flex-col gap-2.5">
                  {ROUTES_DATA.map((route) => {
                    const isSelected = route.id === selectedRouteId;
                    const isDelayed = route.status === "Delayed";
                    return (
                      <div
                        key={route.id}
                        onClick={() => setSelectedRouteId(route.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex justify-between items-center ${isSelected
                          ? "bg-[#0a2342] border-[#0a2342] text-white shadow-lg shadow-[#0a2342]/10"
                          : "bg-white border-slate-200 text-slate-800 hover:border-[#00c2cb] hover:translate-x-1"
                          }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px] font-extrabold leading-none">{route.displayName}</span>
                          <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                            {route.stops[0].name} ➔ {route.stops[route.stops.length - 1].name}
                          </span>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isDelayed
                          ? "bg-red-500/10 text-red-500"
                          : isSelected ? "bg-white/10 text-emerald-300" : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                          {route.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>



              {/* Official Yellow Board Replication */}
              <div className="bg-[#FACC15] border-2 border-black rounded-2xl p-5 shadow-md text-left flex flex-col gap-4 text-black font-sans relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="text-[14px] font-black tracking-tight leading-none text-black uppercase">MUL BUS SERVICE</h2>
                    <span className="text-[9px] font-black text-black tracking-widest uppercase mt-1">FOR STUDENTS</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-black shadow-sm">
                    <span className="text-[10px] font-black">MUL</span>
                  </div>
                </div>

                <div className="bg-black text-white text-center py-1.5 px-3 rounded-lg text-[9.5px] font-black uppercase tracking-wider">
                  Official Transit Info
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-black/15 text-[11px] font-bold text-black/80">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-black">📞</span>
                    <div>
                      <span className="text-[9px] text-black/55 block font-bold leading-none">CONTACT NUMBERS</span>
                      <strong className="text-black text-[11.5px] font-black">0301-2312584 | 0300-4697574</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-black">✉️</span>
                    <div>
                      <span className="text-[9px] text-black/55 block font-bold leading-none">EMAIL ADDRESS</span>
                      <strong className="text-black text-[11.5px] font-black">talha.admin@mul.edu.pk</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-black">🏢</span>
                    <div>
                      <span className="text-[9px] text-black/55 block font-bold leading-none">OFFICE LOCATION</span>
                      <strong className="text-black text-[11.5px] font-black">Administration Office, MUL</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live SVG Map & Stop Timelines */}
            <div className="flex flex-col gap-6">
              {/* Map Panel */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="flex justify-between items-center mb-4 text-left">
                  <div>
                    <h3 className="text-[15px] font-black text-[#0a2342]">{t("Live Route Map")}</h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{t("Interactive directions map from Minhaj University")}</p>
                  </div>
                  <span className="bg-[#00c2cb]/10 text-[#00c2cb] text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">{activeRoute.displayName}</span>
                </div>

                <div className="relative w-full aspect-[2.2/1] bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner max-md:aspect-[1.5/1]">
                  <iframe
                    title="Google Map Directions"
                    src={
                      selectedRouteId === "route-1"
                        ? "https://maps.google.com/maps?q=Minhaj%20University%20Lahore%20to%20Qartaba%20Chowk%20Lahore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                        : "https://maps.google.com/maps?q=Minhaj%20University%20Lahore%20to%20Johar%20Town%20Lahore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full block"
                  />
                </div>
              </div>

              {/* Stop Timeline Details */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.02)] text-left flex flex-col gap-4">
                <div>
                  <h3 className="text-[15px] font-black text-[#0a2342]">{t("Shuttle Timetable & Route Timeline")}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{t("Arrival times and coordinates per stop station")}</p>
                </div>

                <div className="relative pl-6 flex flex-col gap-6 mt-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {activeRoute.stops.map((stop, i) => (
                    <div key={i} className="relative flex justify-between items-start gap-4">
                      {/* Timeline Dot Indicator */}
                      <span className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-[3px] flex items-center justify-center shrink-0" style={{ borderColor: activeRoute.color }}>
                        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                      </span>

                      <div className="flex flex-col text-left gap-0.5">
                        <span className="text-[13px] font-black text-[#0a2342] leading-tight">{stop.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">{stop.desc}</span>
                      </div>

                      <div className="flex flex-col items-end shrink-0 text-right">
                        <span className="text-[13px] font-black text-[#0a2342]" style={{ color: activeRoute.color }}>{stop.time}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{stop.dist}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
