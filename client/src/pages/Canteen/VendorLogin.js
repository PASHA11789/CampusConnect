import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock Login Logic
    setTimeout(() => {
      if (email.trim() === "" || password.trim() === "") {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }

      // Store vendor auth in sessionStorage to isolate it from standard student sessions
      sessionStorage.setItem("vendorToken", "mock_vendor_token_12345");
      sessionStorage.setItem(
        "vendorInfo",
        JSON.stringify({
          name: "Ali",
          email: email,
          restaurantName: "Spice Junction",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        })
      );

      navigate("/vendor/dashboard");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-slate-50 overflow-x-hidden justify-center items-center p-4 max-sm:p-0">
      <div className="flex w-full max-w-6xl min-h-[780px] bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-100 flex-col md:flex-row">

        {/* Left Side: Branding, Features & Bottom Burger Image (matches mockup exactly) */}
        <div className="w-full md:w-[45%] bg-[#F8F9FA] pt-10 px-10 flex flex-col justify-between border-r border-slate-100 max-md:pt-8 max-md:px-8 overflow-hidden">
          <div className="flex-1 flex flex-col">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-10">
              <span className="text-2xl">🍳</span>
              <span className="text-lg font-black tracking-tight text-[#0a2342]">
                Campus<span className="text-[#e2725b]">Connect</span>
              </span>
            </div>

            {/* Heading */}
            <div className="relative mb-4">
              <h1 className="text-4xl font-extrabold text-[#0a2342] tracking-tight leading-tight">
                Vendor <br />
                <span className="text-[#e2725b]">Portal</span>
              </h1>
              <div className="w-10 h-1 bg-[#e2725b] rounded-full mt-3"></div>
            </div>

            {/* Description */}
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-8 max-w-sm">
              Manage your restaurant, menu, orders and grow your business with CampusConnect.
            </p>

            {/* Value Propositions */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 text-lg flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  🍴
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0a2342]">Manage Menu</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Add, update and organize your food items easily.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 text-lg flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  📈
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0a2342]">Track Orders</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    View and manage incoming orders in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 text-lg flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  👛
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0a2342]">Monitor Earnings</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Keep track of sales and earnings every day.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Burger Image sitting flush against borders */}
          <div
            className="mt-auto h-[280px] -mx-10 max-md:-mx-8 relative bg-cover bg-center shrink-0 border-t border-slate-100"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop')`,
              backgroundPosition: 'center 40%'
            }}
          >
            {/* Open flag stick */}
            <div className="absolute top-8 left-16 bg-[#e2725b] text-white font-black text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center justify-center z-10">
              Open
              {/* Flag stick shaft */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-7 bg-amber-900 shadow"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full md:w-[55%] p-12 flex flex-col justify-between max-md:p-8">
          <div className="my-auto max-w-md w-full mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-[#0a2342]">Welcome Back! 👋</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">Sign in to your vendor account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4.5 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 text-xs font-bold shadow-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ✉️
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 pr-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    🔒
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 focus:ring-offset-0 focus:outline-none cursor-pointer"
                  />
                  Remember me
                </label>
                <a href="#forgot" className="text-teal-600 hover:text-teal-700 transition-colors">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-[#0a2342] hover:bg-[#e2725b] active:scale-[0.99] text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(10,35,66,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(226,114,91,0.4)] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Form autofill helper text */}
            <div className="text-center mt-3 text-[10px] font-bold text-slate-400">
              Demo credentials: <span className="text-[#0a2342] cursor-pointer hover:underline" onClick={() => { setEmail("vendor@campusconnect.com"); setPassword("password123"); }}>vendor@campusconnect.com / password123</span>
            </div>

            {/* Footer Navigation */}
            <div className="text-center mt-8 text-[11px] font-bold text-slate-400">
              Don't have an account?{" "}
              <a href="#signup" className="text-teal-600 hover:text-teal-700 transition-colors">
                Sign up here
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-[9px] font-bold text-slate-400 pt-8 border-t border-slate-50 mt-8">
            © 2026 CampusConnect. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
}
