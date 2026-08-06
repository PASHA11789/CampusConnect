import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { getUsers, createUser, deleteUser, updateUserRole, resetUserPassword, updateUser } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

const DEFAULT_DEPARTMENTS = [
  "All Departments",
  "Computer Science & IT",
  "Software Engineering",
  "Business Administration",
  "Electrical Engineering",
  "Mathematics & Statistics",
  "English & Humanities",
  "Law & Political Science",
  "Islamic Studies"
];

const DEFAULT_SEMESTERS = [
  "All Semesters",
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "9th Semester",
  "10th Semester",
  "Alumni / Graduated"
];

const DEFAULT_SECTIONS = [
  "All Sections",
  "Section A",
  "Section B",
  "Section C",
  "Section D",
  "Section E",
  "Evening Section"
];

const UsersManager = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Current logged in user (Admin)
  const [currentUser, setCurrentUser] = useState(null);

  // Search & Category Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedSemester, setSelectedSemester] = useState('All Semesters');
  const [selectedSection, setSelectedSection] = useState('All Sections');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  // View Mode: 'table' or 'grid'
  const [viewMode, setViewMode] = useState('table');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // Form states for Create User
  const [newUserData, setNewUserData] = useState({
    name: '', email: '', password: '', role: 'student', registrationNumber: '', department: 'Computer Science & IT', semester: '4th Semester'
  });

  // Form states for Edit User
  const [editUserData, setEditUserData] = useState({
    _id: '', name: '', email: '', registeration_number: '', department: '', semester: '4th Semester'
  });

  // Form states for Reset Password
  const [resetData, setResetData] = useState({
    userId: null, userName: '', adminPassword: '', newStudentPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Helper function to resolve department for a user
  const getUserDepartment = (user) => {
    if (user && user.department !== undefined && user.department !== null) {
      const deptStr = String(user.department).trim();
      if (deptStr !== '') {
        return deptStr;
      }
    }
    const reg = String(user?.registeration_number || user?.registration_no || '').toLowerCase();
    if (reg.includes('cs') || reg.includes('bscs') || reg.includes('it')) return "Computer Science & IT";
    if (reg.includes('se') || reg.includes('bsse')) return "Software Engineering";
    if (reg.includes('bba') || reg.includes('mba')) return "Business Administration";
    if (reg.includes('ee')) return "Electrical Engineering";
    if (reg.includes('math')) return "Mathematics & Statistics";
    if (reg.includes('eng')) return "English & Humanities";
    if (reg.includes('law')) return "Law & Political Science";
    return "Computer Science & IT";
  };

  // Helper function to resolve semester for a user
  const getUserSemester = (user) => {
    if (user && user.semester !== undefined && user.semester !== null) {
      const semStr = String(user.semester).trim();
      if (semStr !== '') {
        if (!isNaN(semStr)) {
          const n = parseInt(semStr, 10);
          const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
          return `${n}${suffix} Semester`;
        }
        return semStr;
      }
    }
    if (user?.role === 'alumni') return "Alumni / Graduated";
    const reg = String(user?.registeration_number || user?.registration_no || '').toUpperCase();
    if (reg.includes('2025F') || reg.includes('25F')) return "2nd Semester";
    if (reg.includes('2025S') || reg.includes('25S')) return "1st Semester";
    if (reg.includes('2024F') || reg.includes('24F')) return "4th Semester";
    if (reg.includes('2024S') || reg.includes('24S')) return "3rd Semester";
    if (reg.includes('2023F') || reg.includes('23F')) return "6th Semester";
    if (reg.includes('2023S') || reg.includes('23S')) return "5th Semester";
    if (reg.includes('2022F') || reg.includes('22F')) return "8th Semester";
    if (reg.includes('2022S') || reg.includes('22S')) return "7th Semester";
    return "4th Semester";
  };

  // Helper function to resolve section for a user
  const getUserSection = (user) => {
    if (user && user.section !== undefined && user.section !== null) {
      const secStr = String(user.section).trim();
      if (secStr !== '') {
        return secStr.toLowerCase().startsWith('section') ? secStr : `Section ${secStr.toUpperCase()}`;
      }
    }
    const reg = String(user?.registeration_number || user?.registration_no || '').toUpperCase();
    if (reg.includes('-A') || reg.includes('SEC-A') || reg.includes('SECA')) return "Section A";
    if (reg.includes('-B') || reg.includes('SEC-B') || reg.includes('SECB')) return "Section B";
    if (reg.includes('-C') || reg.includes('SEC-C') || reg.includes('SECC')) return "Section C";
    if (reg.includes('-D') || reg.includes('SEC-D') || reg.includes('SECD')) return "Section D";
    if (reg.includes('EVE') || reg.includes('EVENING')) return "Evening Section";
    const digits = reg.replace(/\D/g, '');
    if (digits) {
      const lastDigit = parseInt(digits.slice(-1), 10);
      return lastDigit % 2 === 0 ? "Section B" : "Section A";
    }
    return "Section A";
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...newUserData };
      // Convert "4th Semester" to 4
      if (payload.semester) {
        let semNum = parseInt(String(payload.semester).replace(/\D/g, ''), 10);
        if (isNaN(semNum)) semNum = 0;
        payload.semester = semNum;
      }

      await createUser(payload);
      setIsCreateModalOpen(false);
      setNewUserData({ name: '', email: '', password: '', role: 'student', registrationNumber: '', department: 'Computer Science & IT', semester: '4th Semester', section: 'Section A' });
      fetchUsersData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await resetUserPassword(resetData.userId, resetData.adminPassword, resetData.newStudentPassword);
      setIsResetModalOpen(false);
      setResetData({ userId: null, userName: '', adminPassword: '', newStudentPassword: '' });
      alert("User password has been successfully reset!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResetModal = (user) => {
    setResetData({ userId: user._id, userName: user.name, adminPassword: '', newStudentPassword: '' });
    setIsResetModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditUserData({
      _id: user._id,
      name: user.name,
      email: user.email,
      registeration_number: user.registeration_number || user.registration_no || '',
      department: getUserDepartment(user),
      semester: getUserSemester(user),
      section: getUserSection(user)
    });
    setIsEditUserModalOpen(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...editUserData };
      
      // Convert "4th Semester" to 4
      if (payload.semester) {
        let semNum = parseInt(String(payload.semester).replace(/\D/g, ''), 10);
        if (isNaN(semNum)) semNum = 0;
        payload.semester = semNum;
      }

      await updateUser(payload._id, payload);
      
      // Update local state and map the correct semester for the view
      setUsers(users.map(u => u._id === editUserData._id ? { ...u, ...editUserData, semester: payload.semester } : u));
      setIsEditUserModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter(u => {
    const nameMatch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const regNum = (u.registeration_number || u.registration_no || '').toLowerCase();
    const regMatch = regNum.includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || regMatch;

    const dept = getUserDepartment(u);
    const matchesDepartment = selectedDepartment === 'All Departments' || dept === selectedDepartment;

    const sem = getUserSemester(u);
    const matchesSemester = selectedSemester === 'All Semesters' || sem === selectedSemester;

    const sec = getUserSection(u);
    const matchesSection = selectedSection === 'All Sections' || sec === selectedSection;

    const matchesRole = selectedRole === 'All Roles' || u.role === selectedRole;

    return matchesSearch && matchesDepartment && matchesSemester && matchesSection && matchesRole;
  });

  // Calculate unique departments for dynamic filter options
  const existingDepartments = Array.from(new Set(users.map(u => getUserDepartment(u))));
  const allDepartmentOptions = Array.from(new Set(["All Departments", ...DEFAULT_DEPARTMENTS.slice(1), ...existingDepartments]));

  // Stats calculation
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAdminsMods = users.filter(u => u.role === 'campus_admin' || u.role === 'student_mod').length;
  const uniqueDepartmentsCount = existingDepartments.length;

  return (
    <>
      <div className="flex h-screen w-full max-w-full overflow-hidden bg-[#FAF7F0] font-sans text-slate-800 animate-fade-in">
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
          <Topbar
            time={time}
            user={currentUser}
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          />

          <div className="flex-1 px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6 max-w-full">

            {/* ── HERO BANNER & CONSOLE HEADER ── */}
            <div className="bg-[#071A35] rounded-[1.5rem] p-5 sm:p-7 text-white border border-white/10 shadow-[0_12px_35px_rgba(7,26,53,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
              {/* Glow Accents */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00c2cb]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00c2cb]/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col text-left z-10">
                <div className="bg-white/10 text-[#00c2cb] text-[10px] sm:text-[10.5px] font-black tracking-widest uppercase px-3 py-1 rounded-full w-fit flex items-center gap-1.5 mb-2.5 border border-white/10">
                  <span>🛡️</span>
                  <span>ADMINISTRATION CONSOLE</span>
                </div>
                <h1 className="text-[22px] sm:text-[26px] font-black text-white leading-tight tracking-tight mb-1">
                  User Management &amp; Directory
                </h1>
                <p className="text-[11.5px] sm:text-[12px] font-semibold text-white/70 max-w-[600px] leading-relaxed m-0">
                  Manage student profiles, assign administrative roles, filter by department &amp; semester, and configure security access.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] font-black px-5 py-3 rounded-full text-[12px] sm:text-[12.5px] transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 z-10 hover:scale-105 active:scale-95 border-none"
              >
                <span>+</span> Create New User
              </button>
            </div>

            {/* ── METRIC STATS CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
              <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#071A35]/10 text-[#071A35] flex items-center justify-center text-xl shrink-0">
                  👥
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[20px] font-black text-[#071A35] leading-none">{users.length}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate">Total Registered Users</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#00c2cb]/15 text-[#00a8b5] flex items-center justify-center text-xl shrink-0">
                  🎓
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[20px] font-black text-[#071A35] leading-none">{totalStudents}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate">Active Students</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-xl shrink-0">
                  🏢
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[20px] font-black text-[#071A35] leading-none">{uniqueDepartmentsCount}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate">Active Departments</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                  🛡️
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[20px] font-black text-[#071A35] leading-none">{totalAdminsMods}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate">Admins &amp; Moderators</span>
                </div>
              </div>
            </div>

            {/* ── CATEGORIES & FILTER TOOLBAR ── */}
            <div className="bg-white rounded-[1.5rem] border border-[#E8E1D5] p-4 sm:p-5 shadow-[0_8px_25px_rgba(7,26,53,0.04)] flex flex-col gap-4">

              {/* Header Title & View Toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E8E1D5]/60 pb-3.5">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-base">📁</span>
                  <h3 className="text-[14px] font-black text-[#071A35] uppercase tracking-wide">
                    Department &amp; Semester Categories Filter
                  </h3>
                  <span className="text-[11px] font-extrabold bg-[#00c2cb]/15 text-[#0079c2] px-2.5 py-0.5 rounded-full">
                    {filteredUsers.length} Results
                  </span>
                </div>

                {/* View Switcher: Table vs Grid */}
                <div className="flex items-center gap-1 bg-[#FAF7F0] p-1 rounded-xl border border-[#E8E1D5] self-end sm:self-auto">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border-none ${viewMode === 'table' ? "bg-[#071A35] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <span>📋</span> Table
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 cursor-pointer border-none ${viewMode === 'grid' ? "bg-[#071A35] text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                  >
                    <span>🎴</span> Cards
                  </button>
                </div>
              </div>

              {/* Category Filter Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                {/* Search Input */}
                <div className="relative flex items-center w-full">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search name, email, roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-8 py-2.5 text-[12px] font-semibold text-[#071A35] placeholder-slate-400 focus:outline-none focus:border-[#00c2cb] focus:bg-white transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer">
                      ✕
                    </button>
                  )}
                </div>

                {/* Department Dropdown Filter */}
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3 text-sm pointer-events-none">🏢</span>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-7 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer"
                  >
                    {allDepartmentOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Semester Dropdown Filter */}
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3 text-sm pointer-events-none">🎓</span>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-7 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer"
                  >
                    {DEFAULT_SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Section Dropdown Filter */}
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3 text-sm pointer-events-none">🔖</span>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-7 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer"
                  >
                    {DEFAULT_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Role Filter Dropdown */}
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3 text-sm pointer-events-none">🏷️</span>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-7 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="All Roles">All Roles</option>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="student_mod">Moderator</option>
                    <option value="campus_admin">Campus Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* Active Category Badges & Clear button */}
              {(selectedDepartment !== 'All Departments' || selectedSemester !== 'All Semesters' || selectedSection !== 'All Sections' || selectedRole !== 'All Roles' || searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E8E1D5]/40 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>
                  {selectedDepartment !== 'All Departments' && (
                    <span className="bg-[#071A35] text-white text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🏢 {selectedDepartment}
                      <button onClick={() => setSelectedDepartment('All Departments')} className="hover:text-red-300 ml-1">✕</button>
                    </span>
                  )}
                  {selectedSemester !== 'All Semesters' && (
                    <span className="bg-[#00c2cb] text-[#071A35] text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🎓 {selectedSemester}
                      <button onClick={() => setSelectedSemester('All Semesters')} className="hover:text-red-700 ml-1">✕</button>
                    </span>
                  )}
                  {selectedSection !== 'All Sections' && (
                    <span className="bg-emerald-700 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🔖 {selectedSection}
                      <button onClick={() => setSelectedSection('All Sections')} className="hover:text-red-200 ml-1">✕</button>
                    </span>
                  )}
                  {selectedRole !== 'All Roles' && (
                    <span className="bg-purple-600 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🏷️ {selectedRole}
                      <button onClick={() => setSelectedRole('All Roles')} className="hover:text-red-300 ml-1">✕</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="bg-slate-200 text-slate-800 text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🔍 "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-red-600 ml-1">✕</button>
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDepartment('All Departments');
                      setSelectedSemester('All Semesters');
                      setSelectedSection('All Sections');
                      setSelectedRole('All Roles');
                    }}
                    className="text-[11px] font-extrabold text-red-500 hover:underline ml-auto cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold border border-red-200">
                {error}
              </div>
            )}

            {/* ── USER DIRECTORY CONTAINER ── */}
            <div className="bg-white border border-[#E8E1D5] rounded-[1.5rem] p-5 shadow-[0_8px_25px_rgba(7,26,53,0.04)] overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-9 h-9 border-3 border-[#E8E1D5] border-t-[#00c2cb] rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-400">Loading student directory...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center text-2xl mb-3 shadow-inner">
                    🔍
                  </div>
                  <h4 className="text-[15px] font-black text-[#071A35] mb-1">No Users Match Selected Category</h4>
                  <p className="text-[12px] font-semibold text-slate-500 max-w-sm mb-4">
                    Try adjusting your department, semester, or role filter options.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDepartment('All Departments');
                      setSelectedSemester('All Semesters');
                      setSelectedRole('All Roles');
                    }}
                    className="bg-[#071A35] text-white px-4 py-2 rounded-full text-xs font-black hover:bg-[#00c2cb] hover:text-[#071A35] transition-colors shadow-sm cursor-pointer border-none"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : viewMode === 'table' ? (
                /* Table View */
                <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <table className="w-full text-left border-collapse min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-[#E8E1D5] text-[11px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 px-3 whitespace-nowrap">Student &amp; User Details</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Roll / Reg #</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Department</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Semester</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Section</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Role</th>
                        <th className="pb-3 px-3 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(u => {
                        const dept = getUserDepartment(u);
                        const sem = getUserSemester(u);
                        const sec = getUserSection(u);
                        return (
                          <tr key={u._id} className="hover:bg-[#FAF7F0]/60 transition-colors group">
                            {/* User details */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#071A35] text-[#00c2cb] flex items-center justify-center font-black text-sm border border-[#071A35]/20 overflow-hidden shrink-0 shadow-xs">
                                  {u.avatar ? (
                                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                  ) : (
                                    u.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="flex flex-col text-left whitespace-nowrap">
                                  <span className="text-[13.5px] font-black text-[#071A35] leading-snug group-hover:text-[#00c2cb] transition-colors">{u.name}</span>
                                  <span className="text-[11px] font-semibold text-slate-500">{u.email}</span>
                                </div>
                              </div>
                            </td>

                            {/* Registration # */}
                            <td className="py-3.5 px-3">
                              <span className="font-mono text-[11.5px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block whitespace-nowrap">
                                {u.registeration_number || u.registration_no || 'N/A'}
                              </span>
                            </td>

                            {/* Department Tag */}
                            <td className="py-3.5 px-3">
                              <span className="text-[11px] font-black text-[#071A35] bg-[#071A35]/5 border border-[#071A35]/10 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                                🏢 {dept}
                              </span>
                            </td>

                            {/* Semester Tag */}
                            <td className="py-3.5 px-3">
                              <span className="text-[11px] font-black text-[#0079c2] bg-[#00c2cb]/15 border border-[#00c2cb]/30 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                                🎓 {sem}
                              </span>
                            </td>

                            {/* Section Tag */}
                            <td className="py-3.5 px-3">
                              <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                                🔖 {sec}
                              </span>
                            </td>

                            {/* Role Selector */}
                            <td className="py-3.5 px-3">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                className={`text-[11.5px] font-extrabold rounded-lg px-2.5 py-1.5 border focus:outline-none cursor-pointer transition-colors ${u.role === 'campus_admin' ? "bg-[#071A35] text-[#00c2cb] border-[#071A35]" :
                                  u.role === 'student_mod' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                    u.role === 'alumni' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                      "bg-slate-50 text-slate-800 border-slate-200"
                                  }`}
                                disabled={u._id === currentUser?._id}
                              >
                                <option value="student">Student</option>
                                <option value="alumni">Alumni</option>
                                <option value="student_mod">Moderator</option>
                                <option value="campus_admin">Campus Admin</option>
                              </select>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openResetModal(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[11px] font-black hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
                                  title="Reset User Password"
                                >
                                  🔑 Reset
                                </button>
                                <button
                                  onClick={() => openEditModal(u)}
                                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
                                  title="Edit User Info"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  disabled={u._id === currentUser?._id}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-30 cursor-pointer"
                                  title="Delete User Account"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Grid Cards View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map(u => {
                    const dept = getUserDepartment(u);
                    const sem = getUserSemester(u);
                    return (
                      <div key={u._id} className="bg-white border border-[#E8E1D5] rounded-2xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all hover:border-[#00c2cb] text-left relative overflow-hidden">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#071A35] text-[#00c2cb] flex items-center justify-center font-black text-lg border border-[#071A35]/20 overflow-hidden shrink-0 shadow-xs">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                              ) : (
                                u.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <h4 className="text-[14px] font-black text-[#071A35] leading-snug truncate">{u.name}</h4>
                              <span className="text-[11px] font-semibold text-slate-500 truncate">{u.email}</span>
                            </div>
                          </div>
                        </div>

                        {/* Details Badges */}
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Reg #:</span>
                            <span className="font-mono font-bold text-slate-700">{u.registeration_number || u.registration_no || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Department:</span>
                            <span className="font-black text-[#071A35]">{dept}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Semester:</span>
                            <span className="font-black text-[#0079c2]">{sem}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">Section:</span>
                            <span className="font-black text-emerald-700">{getUserSection(u)}</span>
                          </div>
                        </div>

                        {/* Role Select & Actions */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="text-[11px] font-extrabold rounded-lg px-2 py-1 border focus:outline-none cursor-pointer bg-slate-50"
                            disabled={u._id === currentUser?._id}
                          >
                            <option value="student">Student</option>
                            <option value="alumni">Alumni</option>
                            <option value="student_mod">Moderator</option>
                            <option value="campus_admin">Campus Admin</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openResetModal(u)}
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10.5px] font-bold hover:bg-amber-100 transition-colors"
                            >
                              🔑 Reset
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              disabled={u._id === currentUser?._id}
                              className="p-1 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-30"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ── CREATE USER MODAL (Forum / Profile Theme) ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-white border border-[#E8E1D5] rounded-2xl sm:rounded-3xl max-w-lg w-full shadow-[0_20px_50px_rgba(7,26,53,0.25)] relative animate-modal-slide-in flex flex-col overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-[#071A35] px-6 py-4 flex justify-between items-center text-white border-b border-[#071A35]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-lg text-[#00c2cb]">
                  👤
                </div>
                <h2 className="text-base sm:text-lg font-black text-white">Create New User</h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="e.g. Ali Ahmed" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Email Address <span className="text-red-500">*</span></label>
                <input required type="email" value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="student@minhaj.edu.pk" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Registration / Roll Number <span className="text-red-500">*</span></label>
                <input required type="text" value={newUserData.registrationNumber} onChange={e => setNewUserData({ ...newUserData, registrationNumber: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="e.g. 2024F-MULBSCS-042" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Department</label>
                  <select value={newUserData.department} onChange={e => setNewUserData({ ...newUserData, department: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-2.5 py-2.5 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]">
                    {DEFAULT_DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Semester</label>
                  <select value={newUserData.semester} onChange={e => setNewUserData({ ...newUserData, semester: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-2.5 py-2.5 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]">
                    {DEFAULT_SEMESTERS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Section</label>
                  <input type="text" value={newUserData.section || ''} onChange={e => setNewUserData({ ...newUserData, section: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="e.g. Section A" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Initial Password <span className="text-red-500">*</span></label>
                  <input required type="text" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="Pass123" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Role</label>
                  <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3 py-2.5 text-[12px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]">
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>
                    <option value="student_mod">Moderator</option>
                    <option value="campus_admin">Campus Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-[#E8E1D5]">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#00c2cb] hover:bg-[#00a8b5] text-[#071A35] py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md border-none cursor-pointer flex items-center justify-center">
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-fade-in" onClick={() => setIsResetModalOpen(false)}>
          <div className="bg-white border border-[#E8E1D5] rounded-2xl max-w-sm w-full shadow-[0_20px_50px_rgba(7,26,53,0.25)] relative animate-modal-slide-in flex flex-col overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-[#071A35] px-6 py-4 flex justify-between items-center text-white border-b border-[#071A35]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔑</span>
                <h2 className="text-base font-black text-white">Reset User Password</h2>
              </div>
              <button onClick={() => setIsResetModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20">✕</button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60">
              <p className="text-[12px] font-semibold text-slate-600 m-0">
                Resetting password for: <strong className="text-[#071A35] font-black">{resetData.userName}</strong>
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">New Password For User <span className="text-red-500">*</span></label>
                <input required type="text" value={resetData.newStudentPassword} onChange={e => setResetData({ ...resetData, newStudentPassword: e.target.value })} className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="Enter new strong password" />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#E8E1D5] pt-3">
                <label className="text-[12px] font-extrabold text-red-600">Your Admin Password (Confirmation) <span className="text-red-500">*</span></label>
                <input required type="password" value={resetData.adminPassword} onChange={e => setResetData({ ...resetData, adminPassword: e.target.value })} className="w-full bg-[#FAF7F0] border border-red-200 rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-red-500" placeholder="Verify with your admin password" />
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="flex-1 bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md border-none cursor-pointer">
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT USER DETAILS MODAL ── */}
      {isEditUserModalOpen && (
        <div className="fixed inset-0 bg-[#071A35]/65 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-fade-in" onClick={() => setIsEditUserModalOpen(false)}>
          <div className="bg-white border border-[#E8E1D5] rounded-2xl max-w-lg w-full shadow-[0_20px_50px_rgba(7,26,53,0.25)] relative animate-modal-slide-in flex flex-col overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-[#071A35] px-6 py-4 flex justify-between items-center text-white border-b border-[#071A35]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">✏️</span>
                <h2 className="text-base font-black text-white">Edit User Profile</h2>
              </div>
              <button onClick={() => setIsEditUserModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20">✕</button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Full Name</label>
                <input required type="text" value={editUserData.name} onChange={e => setEditUserData({ ...editUserData, name: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Email</label>
                <input required type="email" value={editUserData.email} onChange={e => setEditUserData({ ...editUserData, email: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Registration #</label>
                <input required type="text" value={editUserData.registeration_number} onChange={e => setEditUserData({ ...editUserData, registeration_number: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Department</label>
                  <select value={editUserData.department} onChange={e => setEditUserData({ ...editUserData, department: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-2.5 py-2.5 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]">
                    {DEFAULT_DEPARTMENTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Semester</label>
                  <select value={editUserData.semester} onChange={e => setEditUserData({ ...editUserData, semester: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-2.5 py-2.5 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]">
                    {DEFAULT_SEMESTERS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-extrabold text-[#071A35]">Section</label>
                  <select value={editUserData.section} onChange={e => setEditUserData({ ...editUserData, section: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-2.5 py-2.5 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]">
                    {DEFAULT_SECTIONS.slice(1).map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-3 pt-3 border-t border-[#E8E1D5]">
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="flex-1 bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-[#071A35] hover:bg-[#00c2cb] hover:text-[#071A35] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md border-none cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersManager;
