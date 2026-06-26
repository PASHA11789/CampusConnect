import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VendorRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("/api/vendor/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        phone: phone.trim(),
        restaurantName: restaurantName.trim(),
        registeration_number: regNumber.trim(),
      });

      // Store vendor auth in sessionStorage to isolate it from standard student sessions
      sessionStorage.setItem("vendorToken", data.token);
      sessionStorage.setItem("vendorInfo", JSON.stringify(data));

      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-slate-50 overflow-x-hidden justify-center items-center p-4 max-sm:p-0">
      <div className="flex w-full max-w-6xl min-h-[850px] bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-100 flex-col md:flex-row">
        
        {/* Left Side: Branding, Features & Bottom Burger Image */}
        <div className="w-full md:w-[40%] bg-[#F8F9FA] pt-10 px-10 flex flex-col justify-between border-r border-slate-100 max-md:pt-8 max-md:px-8 overflow-hidden">
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
                <span className="text-[#e2725b]">Registration</span>
              </h1>
              <div className="w-10 h-1 bg-[#e2725b] rounded-full mt-3"></div>
            </div>

            {/* Description */}
            <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-8 max-w-sm">
              Create your restaurant profile and start serving the campus community.
            </p>

            {/* Feature Cards */}
            <div className="space-y-5 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 text-lg flex items-center justify-center shrink-0 shadow-sm">
                  🚀
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0a2342]">Quick Launch</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Register and set up your online canteen in minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 text-lg flex items-center justify-center shrink-0 shadow-sm">
                  🤝
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#0a2342]">Reach Thousands</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    Connect directly with students, faculty, and campus staff.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Burger Image */}
          <div
            className="mt-auto h-[220px] -mx-10 max-md:-mx-8 relative bg-cover bg-center shrink-0 border-t border-slate-100"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop')`,
              backgroundPosition: 'center 40%'
            }}
          >
            <div className="absolute top-8 left-16 bg-[#e2725b] text-white font-black text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-md flex items-center justify-center z-10">
              Register
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-7 bg-amber-900 shadow"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-[60%] p-12 flex flex-col justify-between max-md:p-8">
          <div className="my-auto max-w-lg w-full mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-[#0a2342]">Create Account 🍳</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">Join the CampusConnect Vendor Network</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4.5 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 text-xs font-bold shadow-sm">
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">👤</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vendor@email.com"
                      required
                      className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">📞</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +923001234567"
                      required
                      className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Restaurant Name */}
                <div>
                  <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-1.5">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🏪</span>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. Spice Junction"
                      required
                      className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Registration Number */}
                <div>
                  <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-1.5">
                    Registration Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🆔</span>
                    <input
                      type="text"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="Unique business/tax ID"
                      required
                      className="w-full pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10.5px] font-black text-[#0a2342] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      required
                      className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-[#0a2342] shadow-sm focus:outline-none focus:border-[#e2725b] focus:ring-4 focus:ring-[#e2725b]/5 transition-all duration-300 placeholder-slate-400"
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-[#0a2342] hover:bg-[#e2725b] active:scale-[0.99] text-white rounded-2xl text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(10,35,66,0.4)] hover:shadow-[0_8px_20px_-6px_rgba(226,114,91,0.4)] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-6 text-[11px] font-bold text-slate-400">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/vendor/login")}
                className="text-[#e2725b] hover:text-[#c4533e] transition-colors cursor-pointer"
              >
                Sign in instead
              </span>
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
