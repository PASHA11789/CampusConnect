import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";

export default function PartnerRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract optional query params (e.g. vendorId)
  const queryParams = new URLSearchParams(location.search);
  const vendorIdFromQuery = queryParams.get("vendorId") || "";

  // Determine initial mode based on current URL path
  const isInitialRider = location.pathname.includes("/rider");
  const [partnerType, setPartnerType] = useState(isInitialRider ? "rider" : "vendor");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    registeration_number: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    vehicleType: "Motorcycle",
    vehicleNumber: "",
    vendorId: vendorIdFromQuery
  });

  const [showPassword, setShowPassword] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      if (partnerType === "vendor") {
        // Vendor Registration
        const { data } = await axios.post("/api/vendor/auth/register", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          phone: formData.phone.trim(),
          restaurantName: formData.restaurantName.trim(),
          registeration_number: formData.registeration_number.trim(),
        });

        sessionStorage.setItem("vendorToken", data.token);
        sessionStorage.setItem("vendorInfo", JSON.stringify(data));
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data));

        navigate("/vendor/dashboard");
      } else {
        // Rider Registration
        const res = await axios.post("/api/rider/auth/register", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          phone: formData.phone.trim(),
          registeration_number: formData.registeration_number.trim(),
          vehicleType: formData.vehicleType,
          vehicleNumber: formData.vehicleNumber.trim(),
          vendorId: formData.vendorId
        }).catch(err => {
          if (err.response?.status === 404 || !err.response) {
            // Client fallback for demo
            const newRider = {
              _id: "rider_" + Date.now(),
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              registeration_number: formData.registeration_number,
              vehicleType: formData.vehicleType,
              vehicleNumber: formData.vehicleNumber,
              vendorId: formData.vendorId,
              role: "rider",
              token: "mock_rider_token_" + Date.now()
            };
            return { data: newRider };
          }
          throw err;
        });

        const data = res.data;
        const token = data.token || "mock_rider_token";

        // Save rider to registered campus riders list
        try {
          const existingRidersStr = localStorage.getItem("registered_campus_riders");
          const existingRiders = existingRidersStr ? JSON.parse(existingRidersStr) : [];
          const riderForList = {
            id: data._id || "rider_" + Date.now(),
            name: data.name || formData.name,
            phone: data.phone || formData.phone,
            vehicle: `${formData.vehicleType || 'Motorcycle'} ${formData.vehicleNumber ? `(${formData.vehicleNumber})` : ''}`.trim(),
            status: "Online",
            deliveries: 0,
            rating: "5.0",
            vendorId: formData.vendorId || ""
          };
          localStorage.setItem("registered_campus_riders", JSON.stringify([riderForList, ...existingRiders]));
        } catch (e) {
          console.error("Error saving registered rider:", e);
        }

        sessionStorage.setItem("riderToken", token);
        sessionStorage.setItem("riderUser", JSON.stringify(data));
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(data));

        navigate("/rider/dashboard");
      }
    } catch (err) {
      console.error("Partner Registration Error:", err);
      setError(err.response?.data?.message || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  const isVendor = partnerType === "vendor";

  return (
    <div className="min-h-screen w-full font-sans bg-slate-900 overflow-y-auto overflow-x-hidden flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 lg:p-8 py-4 sm:py-8">
      <div className="flex w-full max-w-5xl my-auto bg-[#071A35] rounded-2xl sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-700/50 flex-col md:flex-row">

        {/* Left Side: Branding & Features */}
        <div className="w-full md:w-[42%] bg-[#0a2342]/80 p-4 sm:p-7 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/50 overflow-hidden relative">
          
          {/* Subtle background gradient glow */}
          <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
            isVendor ? 'bg-[#e2725b]' : 'bg-[#00c2cb]'
          }`} />

          <div className="flex-1 flex flex-col relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-3.5 sm:mb-5">
              {!isVendor && <span className="text-xl sm:text-2xl">🛵</span>}
              <span className="text-base sm:text-lg font-black tracking-tight text-white">
                Campus<span className={isVendor ? "text-[#e2725b]" : "text-[#00c2cb]"}>Connect</span>
              </span>
              <span className="bg-white/10 text-white/80 text-[9px] sm:text-[10px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-full ml-auto border border-white/10 shrink-0">
                Partner Portal
              </span>
            </div>

            {/* Heading */}
            <div className="relative mb-2.5 sm:mb-3">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {isVendor ? "Vendor" : "Rider"} <br />
                <span className={isVendor ? "text-[#e2725b]" : "text-[#00c2cb]"}>
                  Registration
                </span>
              </h1>
              <div className={`w-8 sm:w-10 h-1 rounded-full mt-1.5 sm:mt-2 transition-colors duration-300 ${
                isVendor ? "bg-[#e2725b]" : "bg-[#00c2cb]"
              }`}></div>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-[11px] sm:text-xs font-semibold leading-relaxed mb-3.5 sm:mb-5 max-w-sm">
              {isVendor 
                ? "Register your restaurant and expand your campus food delivery business."
                : "Join the CampusConnect rider fleet and earn on your schedule."}
            </p>

            {/* Partner Mode Switcher Tabs */}
            <div className="bg-slate-900/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-700/80 mb-3.5 sm:mb-5 grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => { setPartnerType("vendor"); setError(""); }}
                className={`py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
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
                className={`py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-black transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
                  !isVendor 
                    ? "bg-[#00c2cb] text-[#071A35] shadow-md" 
                    : "bg-transparent text-slate-400 hover:text-white"
                }`}
              >
                🛵 Rider
              </button>
            </div>

            {/* Feature Bullet Cards */}
            <div className="space-y-2 sm:space-y-3 mb-3.5 sm:mb-5">
              {isVendor ? (
                <>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 bg-orange-500/20 text-orange-400 rounded-lg text-sm shrink-0">🚀</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Instant Setup</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Register and list menu items instantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg text-sm shrink-0">🤝</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Campus Reach</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Connect directly with students and faculty.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg text-sm shrink-0">⚡</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Flexible Shifts</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Deliver food whenever you are free between classes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 sm:gap-3 bg-white/5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/5">
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm shrink-0">💵</div>
                    <div>
                      <h3 className="text-[11px] sm:text-xs font-black text-white">Fast Payouts</h3>
                      <p className="text-[9.5px] sm:text-[10px] font-semibold text-slate-400 mt-0.5">Earn cash per order and track daily earnings.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2.5 sm:pt-3 border-t border-slate-700/50 text-[9.5px] sm:text-[10.5px] font-semibold text-slate-400 flex items-center justify-between">
            <span>© 2026 CampusConnect</span>
            <span className="text-slate-500">v2.4</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-[58%] p-4 sm:p-7 md:p-9 flex flex-col justify-between bg-[#071A35] text-left">
          <div>
            <div className="mb-3.5 sm:mb-5">
              <h2 className="text-lg sm:text-2xl font-black text-white m-0">
                Create {isVendor ? "Vendor" : "Rider"} Account
              </h2>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5 sm:mt-1">
                Fill in your details to register as a {isVendor ? "Restaurant Vendor" : "Delivery Rider"}.
              </p>
            </div>

            {error && (
              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl text-red-400 text-[11px] sm:text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-2.5 sm:space-y-3.5">
              
              {/* Full Name & Registration Number Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ali Khan"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Reg / Student ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="registeration_number"
                    value={formData.registeration_number}
                    onChange={handleChange}
                    placeholder="FA21-BCS-001"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={isVendor ? "vendor@restaurant.com" : "rider@campus.com"}
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Role-Specific Fields */}
              {isVendor ? (
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Restaurant / Cafe Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleChange}
                    placeholder="Campus Grill Cafe"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#e2725b] focus:ring-2 focus:ring-[#e2725b]/20 transition-all placeholder:text-slate-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                      Vehicle Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all"
                    >
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Scooter">Scooter</option>
                      <option value="On Foot">On Foot / Walker</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                      Vehicle Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      placeholder="LEK-1234"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 pr-11 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[11px] font-bold border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] sm:text-[11px] font-black text-slate-300 uppercase tracking-wider">
                    Confirm Password <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-3 sm:px-3.5 py-2 sm:py-2.5 focus:outline-none focus:border-[#00c2cb] focus:ring-2 focus:ring-[#00c2cb]/20 transition-all placeholder:text-slate-500"
                  />
                </div>
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
                    Registering Account...
                  </>
                ) : (
                  `Register as ${isVendor ? "Vendor" : "Rider"} →`
                )}
              </button>
            </form>
          </div>

          {/* Bottom Login Navigation */}
          <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-800 text-center">
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 m-0">
              Already have a partner account?{" "}
              <Link
                to={isVendor ? "/vendor/login" : "/rider/login"}
                className={`font-black hover:underline transition-colors ml-1 ${
                  isVendor ? "text-[#e2725b]" : "text-[#00c2cb]"
                }`}
              >
                Login as {isVendor ? "Vendor" : "Rider"}
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
