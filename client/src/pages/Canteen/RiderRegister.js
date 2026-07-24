import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function RiderRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract optional vendorId query parameter
  const queryParams = new URLSearchParams(location.search);
  const vendorIdFromQuery = queryParams.get("vendorId") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    registeration_number: "",
    phone: "",
    vehicleType: "Motorcycle",
    vehicleNumber: "",
    password: "",
    confirmPassword: "",
    vendorId: vendorIdFromQuery
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendorIdFromQuery) {
      setFormData(prev => ({ ...prev, vendorId: vendorIdFromQuery }));
    }
  }, [vendorIdFromQuery]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/rider/auth/register", formData).catch(err => {
        if (err.response?.status === 404 || !err.response) {
          // Client fallback for demo
          const newRider = {
            _id: "rider_" + Date.now(),
            name: formData.name,
            email: formData.email,
            registeration_number: formData.registeration_number,
            phone: formData.phone,
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

      // Save rider to global client riders storage for Vendor Dashboard
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
        console.error("Error saving registered rider to list:", e);
      }

      sessionStorage.setItem("riderToken", token);
      sessionStorage.setItem("riderUser", JSON.stringify(data));
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(data));

      navigate("/rider");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-slate-900 overflow-x-hidden justify-center items-center p-4 max-sm:p-0">
      <div className="flex w-full max-w-5xl min-h-[720px] bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden border border-slate-700/50 flex-col md:flex-row">

        {/* Left Side: Branding Banner */}
        <div className="w-full md:w-[40%] bg-slate-900/80 p-10 flex flex-col justify-between border-r border-slate-700/50">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-2xl">🛵</span>
              <span className="text-lg font-black text-white">
                Campus<span className="text-[#00c2cb]">Connect</span>
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
              Become a Campus <br />
              <span className="text-[#00c2cb]">Delivery Rider</span>
            </h1>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              Deliver hot food from campus canteens to students and staff across Minhaj University.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="font-bold text-[#00c2cb]">✓ Fast Order Matching:</span> Receive order tickets as soon as vendors mark food ready.
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                <span className="font-bold text-emerald-400">✓ One-Tap Location Alerts:</span> Alert students directly when you reach their building.
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/60">
            <p className="text-xs text-slate-400">
              Already registered?{" "}
              <button
                onClick={() => navigate("/rider/login")}
                className="text-[#00c2cb] font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In Here
              </button>
            </p>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-[60%] p-8 md:p-12 bg-slate-800 overflow-y-auto">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">
            Rider Registration Form
          </h2>
          <p className="text-slate-400 text-xs font-medium mb-6">
            Fill in your personal & vehicle details to start delivering.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ali Ahmed"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:border-[#00c2cb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rider@minhaj.edu.pk"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:border-[#00c2cb] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0300 1234567"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:border-[#00c2cb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold focus:border-[#00c2cb] focus:outline-none"
                >
                  <option value="Motorcycle">🛵 Motorcycle / Bike</option>
                  <option value="Scooter">🛴 Electric Scooter</option>
                  <option value="Bicycle">🚲 Bicycle</option>
                  <option value="On-Foot">🚶 On-Foot Delivery</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Vehicle Reg / Plate # (Optional)
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="LEC-1234"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:border-[#00c2cb] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:border-[#00c2cb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder:text-slate-500 focus:border-[#00c2cb] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-[#00c2cb] to-[#0079c2] hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <span className="text-lg">➔</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
