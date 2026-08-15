import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import foodFeastImg from "../../assets/vendor_food_feast.jpg";
import { setupPushNotifications } from "../../utils/pushNotificationSetup";

export default function PartnerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      try {
        res = await axios.post("/api/vendor/auth/login", {
          email: email.trim(),
          password: password.trim(),
        });
      } catch (firstErr) {
        // If it's a rate limit error (429), rethrow immediately rather than double-hitting authLimiter
        if (firstErr.response?.status === 429) {
          throw firstErr;
        }
        res = await axios.post("/api/auth/login", {
          email: email.trim(),
          password: password.trim(),
        });
      }

      const data = res.data;
      const token = data.token || "partner_token";
      const userRole = data.role || data.user?.role;

      if (userRole === "rider") {
        sessionStorage.setItem("riderToken", token);
        sessionStorage.setItem("riderInfo", JSON.stringify(data));
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data));
        // Initialize push notifications on mobile gesture
        setupPushNotifications();
        navigate("/rider/dashboard");
      } else {
        sessionStorage.setItem("vendorToken", token);
        sessionStorage.setItem("vendorInfo", JSON.stringify(data));
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data));
        setupPushNotifications();
        navigate("/vendor/dashboard");
      }
    } catch (err) {
      console.error("Partner/Rider Login Error:", err);
      setError(
        err.response?.data?.message ||
          "Invalid credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full font-sans bg-[#12100E] flex items-center justify-center p-0 m-0 overflow-hidden">
      {/* Main Full-Screen End-to-End Container Card */}
      <div className="w-full h-screen min-h-screen p-0 m-0 rounded-none shadow-none border-none flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT PANEL: Rich Food Feast Background & Vignette (Hidden on Mobile) */}
        <div className="hidden md:flex w-full md:w-1/2 min-h-screen relative p-10 lg:p-14 flex-col justify-between overflow-hidden">
          {/* Background Food Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: `url(${foodFeastImg})` }}
          />
          {/* Warm Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/60 to-black/30" />

          {/* Left Content over Image */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="bg-black/40 backdrop-blur-md border border-white/20 text-[#FBBF24] text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full">
              Partner &amp; Rider Portal
            </span>
          </div>

          <div className="relative z-10 max-w-lg mb-4 text-left">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg mb-4">
              CampusConnect <br />
              <span className="text-[#FBBF24]">X Restaurants</span>
            </h2>
            <p className="text-slate-200 text-sm lg:text-base font-medium leading-relaxed drop-shadow">
              Empowering campus vendors with real-time kitchen order streams and instant student delivery dispatch.
            </p>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-slate-300 text-xs font-semibold">
            <span>© 2026 CampusConnect Restaurant Network</span>
            <span>v2.5</span>
          </div>
        </div>

        {/* RIGHT PANEL: Form & Login */}
        <div className="w-full md:w-1/2 bg-[#171410] min-h-screen p-6 sm:p-10 lg:p-16 flex flex-col justify-between text-left h-full overflow-y-auto">
          <div>
            {/* Header: CampusConnect x Restaurants */}
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                CAMPUS<span className="text-[#FBBF24]">CONNECT</span>{" "}
                <span className="text-[#D97706]">X</span>{" "}
                <span className="text-amber-100">RESTAURANTS</span>
              </span>
              <span className="bg-amber-500/10 text-[#FBBF24] border border-[#D97706]/30 text-[10px] font-black uppercase px-3 py-1 rounded-full shrink-0">
                Partner &amp; Rider Portal
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
                Vendor &amp; Rider Account Login
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-400 leading-relaxed max-w-md">
                Manage your campus restaurant, organize menus, or claim &amp; deliver live campus orders.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs sm:text-sm font-bold flex items-center gap-2.5">
                <i className="fa-solid fa-triangle-exclamation" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Partner / Rider Email Address <span className="text-[#FBBF24]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <i className="fa-solid fa-envelope text-xs flex items-center justify-center" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vendor@restaurant.com or rider@campusconnect.com"
                    className="w-full bg-[#221E18] border border-[#363027] text-white text-xs sm:text-sm font-semibold rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                  Password <span className="text-[#FBBF24]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <i className="fa-solid fa-lock text-xs flex items-center justify-center" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#221E18] border border-[#363027] text-white text-xs sm:text-sm font-semibold rounded-2xl pl-11 pr-16 py-3.5 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/20 transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white border-none bg-transparent cursor-pointer transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] active:scale-[0.99] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-[#D97706]/20 border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO PORTAL</span>
                    <i className="fa-solid fa-arrow-right text-xs" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-[#29241D] text-center">
            <span className="text-[11px] font-semibold text-slate-500">
              CampusConnect x Restaurants &bull; Secure Partner Access
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
