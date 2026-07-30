import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

export default function PartnerLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial mode based on current URL path
  const isInitialRider = location.pathname.includes("/rider");
  const [partnerType, setPartnerType] = useState(isInitialRider ? "rider" : "vendor");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync partnerType if user navigates via browser address bar
  useEffect(() => {
    if (location.pathname.includes("/rider")) {
      setPartnerType("rider");
    } else if (location.pathname.includes("/vendor") || location.pathname.includes("/vender")) {
      setPartnerType("vendor");
    }
  }, [location.pathname]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Attempt login request against vendor/partner endpoint, with fallback to main auth endpoint
      let res;
      try {
        res = await axios.post("/api/vendor/auth/login", {
          email: email.trim(),
          password: password.trim()
        });
      } catch (firstErr) {
        res = await axios.post("/api/auth/login", {
          email: email.trim(),
          password: password.trim()
        });
      }

      const data = res.data;
      const token = data.token || "partner_token";

      // Detect role from response or fallback to active partner type
      const isRider = data.role === "rider" || partnerType === "rider";

      if (isRider) {
        sessionStorage.setItem("riderToken", token);
        sessionStorage.setItem("riderUser", JSON.stringify(data));
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(data));
        if (rememberMe) {
          localStorage.setItem("riderToken", token);
          localStorage.setItem("token", token);
        }
        navigate("/rider/dashboard");
      } else {
        sessionStorage.setItem("vendorToken", token);
        sessionStorage.setItem("vendorInfo", JSON.stringify(data));
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(data));
        if (rememberMe) {
          localStorage.setItem("vendorToken", token);
          localStorage.setItem("token", token);
        }
        navigate("/vendor/dashboard");
      }
    } catch (err) {
      console.error("Partner Login Error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const isVendor = partnerType === "vendor";

  return (
    <div className="min-h-screen w-full font-sans bg-slate-900 overflow-y-auto overflow-x-hidden flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 lg:p-8 py-5 sm:py-10">
      <div className="flex w-full max-w-5xl my-auto bg-[#071A35] rounded-2xl sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-700/50 flex-col md:flex-row">

        {/* Left Side: Branding & Features */}
        <div className="w-full md:w-[45%] bg-[#0a2342]/80 p-5 sm:p-7 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/50 overflow-hidden relative">
          
          {/* Subtle background gradient glow */}
          <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
            isVendor ? 'bg-[#e2725b]' : 'bg-[#00c2cb]'
          }`} />

          <div className="flex-1 flex flex-col relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4 sm:mb-5">
              <span className="text-xl sm:text-2xl">{isVendor ? "🍳" : "🛵"}</span>
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                Campus<span className={isVendor ? "text-[#e2725b]" : "text-[#00c2cb]"}>Connect</span>
              </span>
              <span className="bg-white/10 text-white/80 text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full ml-auto border border-white/10 shrink-0">
                Partner Portal
              </span>
            </div>

            {/* Heading */}
            <div className="relative mb-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {isVendor ? "Vendor" : "Delivery Rider"} <br />
                <span className={isVendor ? "text-[#e2725b]" : "text-[#00c2cb]"}>
                  {isVendor ? "Restaurant Portal" : "Campus Fleet"}
                </span>
              </h1>
              <div className={`w-8 sm:w-10 h-1 rounded-full mt-2 transition-colors duration-300 ${
                isVendor ? "bg-[#e2725b]" : "bg-[#00c2cb]"
              }`}></div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-[11px] sm:text-xs font-semibold leading-relaxed mb-4 sm:mb-5 max-w-sm">
              {isVendor 
                ? "Manage your campus restaurant, organize menus, process live orders and grow sales effortlessly."
                : "Deliver food across campus, track earnings in real-time, and get flexible delivery tasks."}
            </p>

            {/* Partner Mode Switcher Tabs */}
            <div className="bg-slate-900/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700/80 mb-4 sm:mb-5 grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => { setPartnerType("vendor"); setError(""); }}
                className={`py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  isVendor 
                    ? "bg-[#e2725b] text-white shadow-md" 
                    : "bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                🍳 Vendor
              </button>
              <button
                type="button"
                onClick={() => { setPartnerType("rider"); setError(""); }}
                className={`py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isVendor 
                    ? "bg-[#00c2cb] text-[#071A35] shadow-md" 
                    : "bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                🛵 Rider
              </button>
            </div>

            {/* Feature Bullet Cards */}
            <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
              {isVendor ? (
                <>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 sm:p-2 bg-orange-500/20 text-orange-400 rounded-lg sm:rounded-xl text-sm sm:text-base shrink-0">🍴</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Menu &amp; Inventory Management</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Update menu items, pricing, and availability in real-time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 sm:p-2 bg-teal-500/20 text-teal-300 rounded-lg sm:rounded-xl text-sm sm:text-base shrink-0">📈</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Live Kitchen Order Stream</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Receive incoming campus food orders instantly with sound notifications.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 sm:p-2 bg-cyan-500/20 text-cyan-300 rounded-lg sm:rounded-xl text-sm sm:text-base shrink-0">🗺️</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Campus GPS Route Dispatch</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Pick up food orders from canteens and deliver directly to student hostels/departments.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 sm:p-2 bg-emerald-500/20 text-emerald-300 rounded-lg sm:rounded-xl text-sm sm:text-base shrink-0">💰</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Instant Delivery Earnings</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Track daily completed deliveries and cash earnings on your dashboard.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/50 text-[10px] sm:text-[10.5px] font-semibold text-slate-400 flex items-center justify-between">
            <span>© 2026 CampusConnect Partner Hub</span>
            <span className="text-slate-500">v2.4</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[55%] p-5 sm:p-7 md:p-9 flex flex-col justify-between bg-[#071A35] text-left">
          <div>
            <div className="mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-white m-0">
                Partner Account Login
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-1">
                Enter your credentials to access your {isVendor ? "Restaurant Vendor" : "Delivery Rider"} portal.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl text-red-400 text-[11px] sm:text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
              
              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                  Partner Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isVendor ? "vendor@restaurant.com" : "rider@campusconnect.com"}
                  className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Password <span className="text-red-400">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 pr-11 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[11px] sm:text-xs font-bold border-none bg-transparent cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-[#00c2cb] focus:ring-0 w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer"
                  />
                  Remember login session
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2.5 sm:mt-3 ${
                  isVendor 
                    ? "bg-[#e2725b] hover:bg-[#d05c44] text-white" 
                    : "bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </>
                ) : (
                  `Login as ${isVendor ? "Restaurant Vendor" : "Delivery Rider"} →`
                )}
              </button>
            </form>
          </div>

          {/* Bottom Registration Navigation */}
          <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 m-0">
              New partner wanting to join CampusConnect?{" "}
              <Link
                to={isVendor ? "/vendor/register" : "/rider/register"}
                className={`font-black hover:underline transition-colors ml-1 ${
                  isVendor ? "text-[#e2725b]" : "text-[#00c2cb]"
                }`}
              >
                Register as {isVendor ? "Vendor" : "Rider"}
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
