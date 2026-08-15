import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { getRestaurants, createRestaurantAdmin, deleteRestaurant } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const RestaurantsManager = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditRestaurantModalOpen, setIsEditRestaurantModalOpen] = useState(false);

  // Form state
  const [newRestaurantData, setNewRestaurantData] = useState({
    name: '', email: '', password: '', registeration_number: '', restaurantName: '', phone: '', address: ''
  });

  const [editRestaurantData, setEditRestaurantData] = useState({
    _id: '', name: '', phone: '', address: ''
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'campus_admin') {
      navigate('/dashboard');
      return;
    }
    setCurrentUser(parsedUser);
    fetchRestaurantsData();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  const fetchRestaurantsData = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      const resName = (newRestaurantData.restaurantName || newRestaurantData.name || "").trim();
      const payload = {
        ...newRestaurantData,
        name: resName,
        restaurantName: resName
      };
      await createRestaurantAdmin(payload);
      setIsCreateModalOpen(false);
      setNewRestaurantData({ name: '', email: '', password: '', registeration_number: '', restaurantName: '', phone: '', address: '' });
      fetchRestaurantsData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create restaurant");
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm("Are you sure you want to delete this restaurant? This will remove its menu and vendor access.")) return;
    try {
      await deleteRestaurant(restaurantId);
      setRestaurants(restaurants.filter(r => r._id !== restaurantId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete restaurant");
    }
  };

  const openEditModal = (restaurant) => {
    setEditRestaurantData({
      _id: restaurant._id,
      name: restaurant.name,
      phone: restaurant.phone,
      address: restaurant.address
    });
    setIsEditRestaurantModalOpen(true);
  };

  const handleEditRestaurant = (e) => {
    e.preventDefault();
    console.log("Saving restaurant details:", editRestaurantData);
    setRestaurants(restaurants.map(r => r._id === editRestaurantData._id ? { ...r, ...editRestaurantData } : r));
    setIsEditRestaurantModalOpen(false);
    alert("Restaurant details updated successfully! (UI Only)");
  };

  return (
    <>
      <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          <Topbar time={time} user={currentUser} onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

          <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">

            {/* ── HERO BANNER ── */}
            <div className="bg-[#071A35] rounded-[1.5rem] p-5 sm:p-7 text-white border border-[#071A35] shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
              {/* Glow Accents */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00c2cb]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col gap-1.5 z-10 text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight m-0">
                  Manage Restaurants &amp; Food Vendors
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-white/70 max-w-xl m-0">
                  Onboard canteen vendors, manage food outlets, and review campus dining operations.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto bg-[#00c2cb] hover:bg-[#00a8b5] text-white px-5 py-3 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 border-none cursor-pointer shrink-0 z-10 hover:scale-105 active:scale-95"
              >
                <span className="text-white font-black text-base leading-none">+</span> Onboard Vendor
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_10px_25px_rgba(0,0,0,0.02)] overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-3 border-slate-200 border-t-[#00c2cb] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 px-4">Restaurant Name</th>
                        <th className="pb-3 px-4">Vendor Email</th>
                        <th className="pb-3 px-4">Phone</th>
                        <th className="pb-3 px-4 text-center">Status</th>
                        <th className="pb-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.map(r => (
                        <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-[#0a2342] text-[14px]">
                            {r.name}
                          </td>
                          <td className="py-4 px-4 text-[13px] font-medium text-slate-600">
                            {r.owner?.email || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-[13px] font-medium text-slate-500">
                            {r.phone}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase ${r.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                              {r.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(r)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                title="Edit Restaurant Details"
                              >
                                <i className="fa-solid fa-pen-to-square text-sm flex items-center justify-center" />
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(r._id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                title="Delete Restaurant"
                              >
                                <i className="fa-solid fa-trash-can text-sm flex items-center justify-center" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {restaurants.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-500 text-sm font-semibold">
                            No restaurants found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Vendor Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-[16px] font-black text-[#0a2342]">Onboard New Vendor</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-1">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
            <form onSubmit={handleCreateRestaurant} className="p-6 flex flex-col gap-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-[#00c2cb] uppercase">Restaurant Name</label>
                  <input required type="text" value={newRestaurantData.restaurantName} onChange={e => setNewRestaurantData({ ...newRestaurantData, restaurantName: e.target.value, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="Mc Donalds" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-[#00c2cb] uppercase">Vendor Email</label>
                  <input required type="email" value={newRestaurantData.email} onChange={e => setNewRestaurantData({ ...newRestaurantData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="vendor@campus.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-[#00c2cb] uppercase">Initial Password</label>
                  <input required type="text" value={newRestaurantData.password} onChange={e => setNewRestaurantData({ ...newRestaurantData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="SecurePass123" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-[#00c2cb] uppercase">Registration Number</label>
                  <input required type="text" value={newRestaurantData.registeration_number} onChange={e => setNewRestaurantData({ ...newRestaurantData, registeration_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="2020F-mulvendor-001" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Phone Number</label>
                  <input required type="text" value={newRestaurantData.phone} onChange={e => setNewRestaurantData({ ...newRestaurantData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="0300-1234567" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Address / Location</label>
                  <input required type="text" value={newRestaurantData.address} onChange={e => setNewRestaurantData({ ...newRestaurantData, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="Food Court, Block A" />
                </div>
              </div>

              <button type="submit" className="mt-4 w-full py-3 rounded-xl bg-[#0a2342] text-white text-[13px] font-bold hover:bg-[#00c2cb] transition-colors border-none cursor-pointer">Onboard Vendor</button>
            </form>
          </div>
        </div>
      )}


      {/* Edit Restaurant Modal */}
      {isEditRestaurantModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditRestaurantModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
              <h2 className="text-[16px] font-black text-blue-800">Edit Restaurant Details</h2>
              <button onClick={() => setIsEditRestaurantModalOpen(false)} className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-1">
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
            <form onSubmit={handleEditRestaurant} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Restaurant Name</label>
                <input required type="text" value={editRestaurantData.name} onChange={e => setEditRestaurantData({ ...editRestaurantData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Phone Number</label>
                <input required type="text" value={editRestaurantData.phone} onChange={e => setEditRestaurantData({ ...editRestaurantData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Address / Location</label>
                <input required type="text" value={editRestaurantData.address} onChange={e => setEditRestaurantData({ ...editRestaurantData, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" />
              </div>
              <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantsManager;
