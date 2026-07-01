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
      await createRestaurantAdmin(newRestaurantData);
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
      <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <Topbar time={time} user={currentUser} />

          <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4">

            <div className="flex justify-between items-center mb-2 max-md:flex-col max-md:items-start max-md:gap-4">
              <div className="flex flex-col">
                <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">Manage Restaurants</h1>
                <p className="text-[12px] text-slate-500 mt-1 font-semibold">Campus Administration / Restaurants</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-full text-[13px] font-bold text-white bg-[#00c2cb] hover:bg-[#00a8b0] transition-colors shadow-md flex items-center gap-2"
              >
                + Onboard Vendor
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
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(r._id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                title="Delete Restaurant"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateRestaurant} className="p-6 flex flex-col gap-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-[#00c2cb] uppercase">Vendor Name</label>
                  <input required type="text" value={newRestaurantData.name} onChange={e => setNewRestaurantData({ ...newRestaurantData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="Ali Khan" />
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

              <div className="border-t border-slate-100 my-1"></div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Restaurant Name</label>
                  <input required type="text" value={newRestaurantData.restaurantName} onChange={e => setNewRestaurantData({ ...newRestaurantData, restaurantName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="Campus Cafe" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Phone Number</label>
                  <input required type="text" value={newRestaurantData.phone} onChange={e => setNewRestaurantData({ ...newRestaurantData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="0300-1234567" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Address / Location</label>
                <input required type="text" value={newRestaurantData.address} onChange={e => setNewRestaurantData({ ...newRestaurantData, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="Food Court, Block A" />
              </div>

              <button type="submit" className="mt-4 w-full py-3 rounded-xl bg-[#0a2342] text-white text-[13px] font-bold hover:bg-[#00c2cb] transition-colors">Onboard Vendor</button>
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
              <button onClick={() => setIsEditRestaurantModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
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
