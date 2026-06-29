import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { getUsers, createUser, deleteUser, updateUserRole, resetUserPassword } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const UsersManager = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  // Current logged in user (Admin)
  const [currentUser, setCurrentUser] = useState(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // Form states for Create User
  const [newUserData, setNewUserData] = useState({
    name: '', email: '', password: '', role: 'student', registrationNumber: ''
  });

  // Form states for Edit User
  const [editUserData, setEditUserData] = useState({
    _id: '', name: '', email: '', registeration_number: '', department: ''
  });

  // Form states for Reset Password
  const [resetData, setResetData] = useState({
    userId: null, adminPassword: '', newStudentPassword: ''
  });

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role !== 'campus_admin') {
      navigate('/dashboard'); // Restrict access
      return;
    }
    setCurrentUser(parsedUser);

    fetchUsersData();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser(newUserData);
      setIsCreateModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'student', registrationNumber: '' });
      fetchUsersData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetUserPassword(resetData.userId, resetData.adminPassword, resetData.newStudentPassword);
      setIsResetModalOpen(false);
      setResetData({ userId: null, adminPassword: '', newStudentPassword: '' });
      alert("Password reset successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    }
  };

  const openResetModal = (userId) => {
    setResetData({ ...resetData, userId, adminPassword: '', newStudentPassword: '' });
    setIsResetModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditUserData({
      _id: user._id,
      name: user.name,
      email: user.email,
      registeration_number: user.registeration_number || user.registration_no || '',
      department: user.department || ''
    });
    setIsEditUserModalOpen(true);
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    console.log("Saving user details:", editUserData);
    setUsers(users.map(u => u._id === editUserData._id ? { ...u, ...editUserData } : u));
    setIsEditUserModalOpen(false);
    alert("User details updated successfully! (UI Only)");
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
                <h1 className="text-[22px] font-black text-[#0a2342] tracking-tight">Manage Users</h1>
                <p className="text-[12px] text-slate-500 mt-1 font-semibold">Campus Administration / Users</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-full text-[13px] font-bold text-white bg-[#00c2cb] hover:bg-[#00a8b0] transition-colors shadow-md flex items-center gap-2"
              >
                + Create New User
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
                        <th className="pb-3 px-4">User Details</th>
                        <th className="pb-3 px-4">Registration #</th>
                        <th className="pb-3 px-4">Role</th>
                        <th className="pb-3 px-4">Joined Date</th>
                        <th className="pb-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-[#0a2342] text-[#00c2cb] flex items-center justify-center font-bold text-sm">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[14px] font-bold text-[#0a2342]">{u.name}</span>
                                <span className="text-[11px] font-medium text-slate-500">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-[13px] font-semibold text-slate-600">
                            {u.registeration_number || u.registration_no || 'N/A'}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-slate-800 text-[12px] font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#00c2cb]"
                              disabled={u._id === currentUser?._id}
                            >
                              <option value="student">Student</option>
                              <option value="alumni">Alumni</option>
                              <option value="student_mod">Moderator</option>
                              <option value="vendor">Vendor</option>
                              <option value="campus_admin">Campus Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-[12px] font-medium text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openResetModal(u._id)}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                                title="Reset Password"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors"
                                title="Edit User Details"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                disabled={u._id === currentUser?._id}
                                className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="Delete User"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-500 text-sm font-semibold">
                            No users found.
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

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-[16px] font-black text-[#0a2342]">Create New User</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Full Name</label>
                <input required type="text" value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="John Doe" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Email</label>
                <input required type="email" value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="user@student.com" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Registration / Roll #</label>
                <input required type="text" value={newUserData.registrationNumber} onChange={e => setNewUserData({ ...newUserData, registrationNumber: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="2024F-mulbscs-001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Initial Password</label>
                  <input required type="text" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-[#00c2cb]" placeholder="Pass123" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Role</label>
                  <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-bold focus:outline-none focus:border-[#00c2cb]">
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="student_mod">Moderator</option>
                    <option value="campus_admin">Campus Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-[#0a2342] text-white text-[13px] font-bold hover:bg-[#00c2cb] transition-colors">Create User</button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50/50">
              <h2 className="text-[16px] font-black text-red-600">Force Reset Password</h2>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">New Password For User</label>
                <input required type="text" value={resetData.newStudentPassword} onChange={e => setResetData({ ...resetData, newStudentPassword: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-red-500" placeholder="New strong password" />
              </div>
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4 mt-2">
                <label className="text-[11px] font-black text-slate-500 uppercase">Confirm With Your Admin Password</label>
                <input required type="password" value={resetData.adminPassword} onChange={e => setResetData({ ...resetData, adminPassword: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-red-500" placeholder="Your current admin password" />
              </div>
              <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-red-600 text-white text-[13px] font-bold hover:bg-red-700 transition-colors">Reset Password</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
              <h2 className="text-[16px] font-black text-blue-800">Edit User Details</h2>
              <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Full Name</label>
                <input required type="text" value={editUserData.name} onChange={e => setEditUserData({ ...editUserData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase">Email</label>
                <input required type="email" value={editUserData.email} onChange={e => setEditUserData({ ...editUserData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Registration #</label>
                  <input required type="text" value={editUserData.registeration_number} onChange={e => setEditUserData({ ...editUserData, registeration_number: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase">Department</label>
                  <input type="text" value={editUserData.department} onChange={e => setEditUserData({ ...editUserData, department: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold focus:outline-none focus:border-blue-500" placeholder="e.g. Computer Science" />
                </div>
              </div>
              <button type="submit" className="mt-2 w-full py-3 rounded-xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersManager;
