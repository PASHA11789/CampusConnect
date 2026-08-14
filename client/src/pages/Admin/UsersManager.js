import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import { getUsers, createUser, deleteUser, updateUserRole, resetUserPassword, updateUser } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────────────────────────────────────────
   Minhaj University Lahore - Official Academic Catalog
───────────────────────────────────────────────────────────────────────────── */
export const MINHAJ_PROGRAMS = {
  "Associate Degree Programs": [
    "Associate Degree in Business Administration",
    "Associate Degree in Accounting and Finance",
    "Associate Degree in Islamic Banking and Finance",
    "Associate Degree in Computer Science",
    "Associate Degree in Mass Communication",
    "Associate Degree in English",
    "Associate Degree in Information Technology",
    "Associate Degree in software Engineering",
    "Associate Degree in Artificial intelligence",
    "Associate Degree in Cyber Security",
    "Associate Degree in Political Science",
    "Associate Degree in Sociology",
    "Associate Degree in Digital Marketing",
    "Associate Degree in Data Science",
    "Associate Degree in Bioinformatics",
    "ADP Information System & Technology Management",
    "Associate Degree in Psychology",
    "Associate Degree in Education",
    "B.Com (Associate Degree in Commerce)"
  ],
  "BS Programs": [
    "BS Human Nutrition and Dietetics",
    "BS Criminology and Forensic Sciences",
    "BS Digital Marketing",
    "BS E-Commerce",
    "BS in Digital Media Communication",
    "BS in Multimedia Arts-Animation",
    "Bachelor of Science in Financial Technology",
    "BS Economics and Data Science",
    "BS Statistics & Data Science",
    "BS Computational Plant Sciences",
    "BS Chemistry & Industrial Entrepreneurship",
    "BS Information System & Technology Management",
    "BS Zoology and Entomology",
    "BS Islamic Banking & Financial Technology",
    "BS Information Management",
    "BS Mathematics & Data Science",
    "BS Defense and Strategic Studies",
    "Bachelor of Laws (LLB) 4 years",
    "BS Business Analytics",
    "BS Psychology",
    "Doctor of Physical Therapy",
    "BS Aesthetics and Cosmetology",
    "BS Computer Science",
    "Doctor of Pharmacy",
    "BS Information Technology",
    "BS Software Engineering",
    "BS Artificial Intelligence",
    "BS Cyber Security",
    "BBA",
    "BS Education",
    "BS Biotechnology",
    "BS Data Science",
    "BS English",
    "BS Political Science",
    "BS International Relations",
    "BS Medical Laboratory Technology",
    "BS Food Science & Technology",
    "BS Economics",
    "BS Economics and Financial Technology",
    "BS Islamic Banking & Finance",
    "B.Com (4 Year)",
    "BS Accounting and Finance",
    "BS Sociology",
    "B.Sc. Chemical Engineering",
    "B.Sc. Electrical Engineering",
    "BS Biochemistry",
    "BS Peace and Conflict Studies"
  ]
};

export const ALL_MINHAJ_PROGRAMS = [
  ...MINHAJ_PROGRAMS["BS Programs"],
  ...MINHAJ_PROGRAMS["Associate Degree Programs"]
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

const ADP_SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester"
];

const BS_SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "9th Semester",
  "10th Semester"
];


export const getProgramCategory = (programOrDept) => {
  if (!programOrDept) return "BS Programs";
  const str = String(programOrDept).toLowerCase();
  if (
    str.includes("associate") ||
    str.includes("adp") ||
    str.includes("associate degree") ||
    MINHAJ_PROGRAMS["Associate Degree Programs"].some(p => p.toLowerCase() === str)
  ) {
    return "Associate Degree Programs";
  }
  return "BS Programs";
};

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
  const [selectedTrack, setSelectedTrack] = useState('All Tracks');
  const [selectedDepartment, setSelectedDepartment] = useState('All Programs');
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
    name: '',
    email: '',
    password: '',
    role: 'student',
    registrationNumber: '',
    programCategory: 'BS Programs',
    department: 'BS Computer Science',
    semester: '1st Semester',
    section: 'Section A'
  });

  // Form states for Edit User
  const [editUserData, setEditUserData] = useState({
    _id: '',
    name: '',
    email: '',
    role: 'student',
    registeration_number: '',
    programCategory: 'BS Programs',
    department: 'BS Computer Science',
    semester: '1st Semester',
    section: 'Section A'
  });

  // Form states for Reset Password
  const [resetData, setResetData] = useState({
    userId: null,
    userName: '',
    adminPassword: '',
    newStudentPassword: ''
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

  // Helper function to resolve course/degree/department for a user
  const getUserDepartment = (user) => {
    if (user?.department && String(user.department).trim() !== '') {
      return String(user.department).trim();
    }
    if (user?.program && String(user.program).trim() !== '' && user.program !== 'BS Programs' && user.program !== 'Associate Degree Programs') {
      return String(user.program).trim();
    }
    const reg = String(user?.registeration_number || user?.registration_no || '').toLowerCase();
    if (reg.includes('bscs') || reg.includes('cs')) return "BS Computer Science";
    if (reg.includes('bsse') || reg.includes('se')) return "BS Software Engineering";
    if (reg.includes('bsit') || reg.includes('it')) return "BS Information Technology";
    if (reg.includes('bba')) return "BBA";
    if (reg.includes('pharm')) return "Doctor of Pharmacy";
    if (reg.includes('dpt')) return "Doctor of Physical Therapy";
    if (reg.includes('llb') || reg.includes('law')) return "Bachelor of Laws (LLB) 4 years";
    if (reg.includes('math')) return "BS Mathematics & Data Science";
    if (reg.includes('eng')) return "BS English";
    if (reg.includes('ds') || reg.includes('data')) return "BS Data Science";
    if (reg.includes('ai')) return "BS Artificial Intelligence";
    if (reg.includes('cyber')) return "BS Cyber Security";
    return "BS Computer Science";
  };

  // Helper function to resolve semester for a user
  const getUserSemester = (user) => {
    if (user?.role === 'alumni') return "Alumni / Graduated";
    if (user?.role === 'campus_admin') return "Campus Admin";
    if (user && user.semester !== undefined && user.semester !== null) {
      const semStr = String(user.semester).trim();
      if (semStr !== '' && semStr !== '0') {
        if (!isNaN(semStr)) {
          const n = parseInt(semStr, 10);
          const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
          return `${n}${suffix} Semester`;
        }
        return semStr;
      }
    }
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
    if (user?.role === 'alumni' || user?.role === 'campus_admin') return "—";
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
      const isNonStudent = newUserData.role === 'alumni' || newUserData.role === 'campus_admin';

      const payload = {
        name: newUserData.name.trim(),
        email: newUserData.email.trim(),
        password: newUserData.password,
        role: newUserData.role,
        registrationNumber: newUserData.registrationNumber.trim(),
        program: isNonStudent ? '' : newUserData.programCategory,
        department: isNonStudent ? '' : newUserData.department,
        section: isNonStudent ? '' : (newUserData.section || 'Section A'),
        semester: 0
      };

      if (!isNonStudent && newUserData.semester) {
        let semNum = parseInt(String(newUserData.semester).replace(/\D/g, ''), 10);
        if (isNaN(semNum)) semNum = 1;
        payload.semester = semNum;
      }

      await createUser(payload);
      setIsCreateModalOpen(false);
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        registrationNumber: '',
        programCategory: 'BS Programs',
        department: 'BS Computer Science',
        semester: '1st Semester',
        section: 'Section A'
      });
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
    const userDept = getUserDepartment(user);
    const category = getProgramCategory(userDept);
    setEditUserData({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'student',
      registeration_number: user.registeration_number || user.registration_no || '',
      programCategory: category,
      department: userDept,
      semester: getUserSemester(user),
      section: getUserSection(user)
    });
    setIsEditUserModalOpen(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isNonStudent = editUserData.role === 'alumni' || editUserData.role === 'campus_admin';

      const payload = {
        _id: editUserData._id,
        name: editUserData.name.trim(),
        email: editUserData.email.trim(),
        role: editUserData.role,
        registeration_number: editUserData.registeration_number.trim(),
        program: isNonStudent ? '' : editUserData.programCategory,
        department: isNonStudent ? '' : editUserData.department,
        section: isNonStudent ? '' : editUserData.section,
        semester: 0
      };

      if (!isNonStudent && editUserData.semester) {
        let semNum = parseInt(String(editUserData.semester).replace(/\D/g, ''), 10);
        if (isNaN(semNum)) semNum = 1;
        payload.semester = semNum;
      }

      await updateUser(payload._id, payload);

      setUsers(users.map(u => u._id === editUserData._id ? {
        ...u,
        ...payload,
        semester: payload.semester
      } : u));

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
    const regNum = (u.registeration_number || u.registration_no || u.registrationNumber || u.registration_number || '').toLowerCase();
    const regMatch = regNum.includes(searchQuery.toLowerCase());
    const dept = getUserDepartment(u);
    const deptMatch = dept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || emailMatch || regMatch || deptMatch;

    const category = getProgramCategory(dept);
    const matchesTrack = selectedTrack === 'All Tracks' || category === selectedTrack;

    const matchesDepartment = selectedDepartment === 'All Programs' || dept === selectedDepartment;

    const sem = getUserSemester(u);
    const matchesSemester = selectedSemester === 'All Semesters' || sem === selectedSemester;

    const sec = getUserSection(u);
    const matchesSection = selectedSection === 'All Sections' || sec === selectedSection;

    const matchesRole = selectedRole === 'All Roles' || String(u.role || '').toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesTrack && matchesDepartment && matchesSemester && matchesSection && matchesRole;
  });


  // Stats calculation
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalAlumni = users.filter(u => u.role === 'alumni').length;
  const totalAdminsMods = users.filter(u => u.role === 'campus_admin' || u.role === 'student_mod').length;

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

              <div className="flex flex-col gap-1.5 z-10 text-left">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Students, Alumni, Mods &amp; Admins
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-xl">
                  Manage student degree programs (ADP &amp; BS), alumni records, campus administrators, and moderator access permissions.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full sm:w-auto bg-[#00c2cb] hover:bg-[#00a8b5] text-white px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_4px_15px_rgba(0,194,203,0.3)] hover:shadow-[0_6px_20px_rgba(0,194,203,0.45)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 border-none cursor-pointer shrink-0 z-10"
              >
                <span className="text-white font-black text-base leading-none">+</span> Add New User
              </button>
            </div>

            {/* ── METRICS OVERVIEW CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="bg-white rounded-2xl border border-[#E8E1D5] p-4 shadow-[0_4px_15px_rgba(7,26,53,0.03)] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#071A35]/10 text-[#071A35] flex items-center justify-center text-xl shrink-0">
                  👥
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[20px] font-black text-[#071A35] leading-none">{users.length}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate">Total Records</span>
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
                  📜
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[20px] font-black text-[#071A35] leading-none">{totalAlumni}</span>
                  <span className="text-[11px] font-bold text-slate-500 mt-1 truncate">Alumni Members</span>
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
                    Minhaj Degree Programs &amp; Directory Filter
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

                {/* Search Input */}
                <div className="relative flex items-center w-full">
                  <i className="fa-solid fa-magnifying-glass text-xs text-slate-400 absolute left-3.5 pointer-events-none flex items-center justify-center" />
                  <input
                    type="text"
                    placeholder="Search name, roll no, course..."
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

                {/* Program Track Filter */}
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3 text-sm pointer-events-none">📚</span>
                  <select
                    value={selectedTrack}
                    onChange={(e) => {
                      setSelectedTrack(e.target.value);
                      setSelectedDepartment('All Programs');
                    }}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-7 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="All Tracks">All Program Tracks</option>
                    <option value="BS Programs">BS Programs (4-5 Years)</option>
                    <option value="Associate Degree Programs">Associate Degree Programs (ADP)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <i className="fa-solid fa-chevron-down text-xs flex items-center justify-center" />
                  </div>
                </div>

                {/* Degree / Course Dropdown Filter */}
                <div className="relative flex items-center w-full">
                  <span className="absolute left-3 text-sm pointer-events-none">🏢</span>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl pl-9 pr-7 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#00c2cb] focus:bg-white appearance-none cursor-pointer truncate"
                  >
                    <option value="All Programs">All Programs &amp; Courses</option>
                    {selectedTrack === 'All Tracks' ? (
                      <>
                        <optgroup label="── BS Programs ──">
                          {MINHAJ_PROGRAMS["BS Programs"].map(p => <option key={p} value={p}>{p}</option>)}
                        </optgroup>
                        <optgroup label="── Associate Degree Programs (ADP) ──">
                          {MINHAJ_PROGRAMS["Associate Degree Programs"].map(p => <option key={p} value={p}>{p}</option>)}
                        </optgroup>
                      </>
                    ) : (
                      MINHAJ_PROGRAMS[selectedTrack]?.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <i className="fa-solid fa-chevron-down text-xs flex items-center justify-center" />
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
                    <i className="fa-solid fa-chevron-down text-xs flex items-center justify-center" />
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
                    <i className="fa-solid fa-chevron-down text-xs flex items-center justify-center" />
                  </div>
                </div>

              </div>

              {/* Active Category Badges & Clear button */}
              {(selectedTrack !== 'All Tracks' || selectedDepartment !== 'All Programs' || selectedSemester !== 'All Semesters' || selectedSection !== 'All Sections' || selectedRole !== 'All Roles' || searchQuery) && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#E8E1D5]/40 text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>
                  {selectedTrack !== 'All Tracks' && (
                    <span className="bg-[#071A35] text-white text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      📚 {selectedTrack}
                      <button onClick={() => setSelectedTrack('All Tracks')} className="hover:text-red-300 ml-1">✕</button>
                    </span>
                  )}
                  {selectedDepartment !== 'All Programs' && (
                    <span className="bg-[#00c2cb] text-[#071A35] text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🏢 {selectedDepartment}
                      <button onClick={() => setSelectedDepartment('All Programs')} className="hover:text-red-700 ml-1">✕</button>
                    </span>
                  )}
                  {selectedSemester !== 'All Semesters' && (
                    <span className="bg-indigo-700 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      🎓 {selectedSemester}
                      <button onClick={() => setSelectedSemester('All Semesters')} className="hover:text-red-300 ml-1">✕</button>
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
                      setSelectedTrack('All Tracks');
                      setSelectedDepartment('All Programs');
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
                  <span className="text-xs font-bold text-slate-400">Loading directory records...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F0] border border-[#E8E1D5] flex items-center justify-center text-2xl mb-3 shadow-inner">
                    🔍
                  </div>
                  <h4 className="text-[15px] font-black text-[#071A35] mb-1">No Users Match Selected Filters</h4>
                  <p className="text-[12px] font-semibold text-slate-500 max-w-sm mb-4">
                    Try adjusting your degree program, semester, or role filter options.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTrack('All Tracks');
                      setSelectedDepartment('All Programs');
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
                        <th className="pb-3 px-3 whitespace-nowrap">Member Details</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Roll / Reg #</th>
                        <th className="pb-3 px-3 whitespace-nowrap">Degree / Program</th>
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
                        const isNonStudent = u.role === 'alumni' || u.role === 'campus_admin';

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
                                {u.registeration_number || u.registration_number || u.registration_no || u.registrationNumber || 'N/A'}
                              </span>
                            </td>

                            {/* Department / Program Tag */}
                            <td className="py-3.5 px-3">
                              {u.role === 'campus_admin' ? (
                                <span className="text-[11px] font-black text-[#071A35] bg-[#071A35]/10 border border-[#071A35]/20 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 shadow-xs">
                                  🛡️ Campus Administrator
                                </span>
                              ) : u.role === 'alumni' ? (
                                <span className="text-[11px] font-black text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 shadow-xs">
                                  🎓 Alumni Member
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-[#071A35] bg-[#071A35]/5 border border-[#071A35]/10 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 shadow-xs">
                                  🏛️ {dept}
                                </span>
                              )}
                            </td>

                            {/* Semester Tag */}
                            <td className="py-3.5 px-3">
                              {isNonStudent ? (
                                <span className="text-[11px] font-bold text-slate-400">—</span>
                              ) : (
                                <span className="text-[11px] font-black text-[#0079c2] bg-[#00c2cb]/15 border border-[#00c2cb]/30 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                                  🎓 {sem}
                                </span>
                              )}
                            </td>

                            {/* Section Tag */}
                            <td className="py-3.5 px-3">
                              {isNonStudent ? (
                                <span className="text-[11px] font-bold text-slate-400">—</span>
                              ) : (
                                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                                  🔖 {sec}
                                </span>
                              )}
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
                                  <i className="fa-solid fa-pen-to-square text-sm flex items-center justify-center" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  disabled={u._id === currentUser?._id}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-30 cursor-pointer"
                                  title="Delete User Account"
                                >
                                  <i className="fa-solid fa-trash-can text-sm flex items-center justify-center" />
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
                    const isNonStudent = u.role === 'alumni' || u.role === 'campus_admin';

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
                            <span className="font-mono font-bold text-slate-700">{u.registeration_number || u.registration_number || u.registration_no || u.registrationNumber || 'N/A'}</span>
                          </div>

                          {isNonStudent ? (
                            <div className="bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8E1D5] flex items-center gap-2 mt-1">
                              <span className="text-base">{u.role === 'alumni' ? '🎓' : '🛡️'}</span>
                              <span className="font-extrabold text-[#071A35] text-[11.5px]">
                                {u.role === 'alumni' ? 'Alumni Member' : 'Campus Administrator'}
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-slate-400 font-bold shrink-0">Program:</span>
                                <span className="font-black text-[#071A35] text-right truncate">{dept}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold">Semester:</span>
                                <span className="font-black text-[#0079c2]">{sem}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-bold">Section:</span>
                                <span className="font-black text-emerald-700">{getUserSection(u)}</span>
                              </div>
                            </>
                          )}
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

      {/* ── CREATE USER MODAL ── */}
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
              <button onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60 max-h-[82vh] overflow-y-auto">
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

              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">User Role <span className="text-red-500">*</span></label>
                <select
                  value={newUserData.role}
                  onChange={e => {
                    const newRole = e.target.value;
                    setNewUserData({ ...newUserData, role: newRole });
                  }}
                  className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                >
                  <option value="student">Student</option>
                  <option value="student_mod">Student Moderator</option>
                  <option value="alumni">Alumni</option>
                  <option value="campus_admin">Campus Admin</option>
                </select>
              </div>

              {/* Dynamic Academic Program Details (Disabled/Invalidated for Alumni & Campus Admin) */}
              {newUserData.role === 'alumni' || newUserData.role === 'campus_admin' ? (
                <div className="bg-gradient-to-r from-[#071A35]/10 to-[#00c2cb]/10 border border-[#071A35]/20 rounded-2xl p-4 flex items-center gap-3.5 my-1">
                  <div className="w-10 h-10 rounded-xl bg-[#071A35] text-white flex items-center justify-center text-xl shrink-0">
                    {newUserData.role === 'alumni' ? '🎓' : '🛡️'}
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-black text-[#071A35] m-0">
                      {newUserData.role === 'alumni' ? 'Alumni Account Role' : 'Campus Administrator Role'}
                    </h4>
                    <p className="text-[11.5px] font-medium text-slate-600 m-0 mt-0.5 leading-snug">
                      Academic enrollment fields (Program, Course, Semester, Section) are disabled for {newUserData.role === 'alumni' ? 'Alumni' : 'Campus Administrators'}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-3.5 bg-white border border-[#E8E1D5] rounded-2xl">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span className="text-sm">🎓</span>
                    <span className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider">
                      Student Academic Program &amp; Class
                    </span>
                  </div>

                  {/* Program Level (Category Track) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-extrabold text-[#071A35]">
                      Program Category (Degree Level)
                    </label>
                    <select
                      value={newUserData.programCategory}
                      onChange={e => {
                        const newCategory = e.target.value;
                        const firstCourse = MINHAJ_PROGRAMS[newCategory][0];
                        setNewUserData({
                          ...newUserData,
                          programCategory: newCategory,
                          department: firstCourse,
                          semester: '1st Semester'
                        });
                      }}
                      className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-3 py-2 text-[12px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                    >
                      <option value="BS Programs">BS Programs (4-5 Years)</option>
                      <option value="Associate Degree Programs">Associate Degree Programs (ADP - 2 Years)</option>
                    </select>
                  </div>

                  {/* Specific Degree / Program (Course) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-extrabold text-[#071A35]">
                      Degree / Program (Course)
                    </label>
                    <select
                      value={newUserData.department}
                      onChange={e => setNewUserData({ ...newUserData, department: e.target.value })}
                      className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-3 py-2 text-[12px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35] truncate"
                    >
                      {MINHAJ_PROGRAMS[newUserData.programCategory]?.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester and Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-extrabold text-[#071A35]">Semester</label>
                      <select
                        value={newUserData.semester}
                        onChange={e => setNewUserData({ ...newUserData, semester: e.target.value })}
                        className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-2.5 py-2 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                      >
                        {(newUserData.programCategory === 'Associate Degree Programs' ? ADP_SEMESTERS : BS_SEMESTERS).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-extrabold text-[#071A35]">Section</label>
                      <input
                        type="text"
                        value={newUserData.section || ''}
                        onChange={e => setNewUserData({ ...newUserData, section: e.target.value })}
                        className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-3 py-2 text-[12px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                        placeholder="e.g. Section A"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Initial Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Initial Password <span className="text-red-500">*</span></label>
                <input required type="text" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" placeholder="Pass123" />
              </div>

              <div className="flex gap-3 mt-2 pt-3 border-t border-[#E8E1D5]">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors cursor-pointer">Cancel</button>
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
              <button onClick={() => setIsResetModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20 cursor-pointer">✕</button>
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
                <button type="button" onClick={() => setIsResetModalOpen(false)} className="flex-1 bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors cursor-pointer">Cancel</button>
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
              <button onClick={() => setIsEditUserModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white flex items-center justify-center border border-white/20 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 flex flex-col gap-4 bg-[#FAF7F0]/60 max-h-[82vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={editUserData.name} onChange={e => setEditUserData({ ...editUserData, name: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Email <span className="text-red-500">*</span></label>
                <input required type="email" value={editUserData.email} onChange={e => setEditUserData({ ...editUserData, email: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">Registration # <span className="text-red-500">*</span></label>
                <input required type="text" value={editUserData.registeration_number} onChange={e => setEditUserData({ ...editUserData, registeration_number: e.target.value })} className="w-full bg-white border border-[#E8E1D5] rounded-xl px-4 py-2.5 text-[12.5px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]" />
              </div>

              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-extrabold text-[#071A35]">User Role</label>
                <select
                  value={editUserData.role}
                  onChange={e => setEditUserData({ ...editUserData, role: e.target.value })}
                  className="w-full bg-white border border-[#E8E1D5] rounded-xl px-3 py-2.5 text-[12px] font-extrabold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                >
                  <option value="student">Student</option>
                  <option value="student_mod">Student Moderator</option>
                  <option value="alumni">Alumni</option>
                  <option value="campus_admin">Campus Admin</option>
                </select>
              </div>

              {/* Dynamic Academic Program Details (Disabled for Alumni & Campus Admin) */}
              {editUserData.role === 'alumni' || editUserData.role === 'campus_admin' ? (
                <div className="bg-gradient-to-r from-[#071A35]/10 to-[#00c2cb]/10 border border-[#071A35]/20 rounded-2xl p-4 flex items-center gap-3.5 my-1">
                  <div className="w-10 h-10 rounded-xl bg-[#071A35] text-white flex items-center justify-center text-xl shrink-0">
                    {editUserData.role === 'alumni' ? '🎓' : '🛡️'}
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-black text-[#071A35] m-0">
                      {editUserData.role === 'alumni' ? 'Alumni Account' : 'Campus Administrator'}
                    </h4>
                    <p className="text-[11.5px] font-medium text-slate-600 m-0 mt-0.5 leading-snug">
                      Academic enrollment fields (Program, Course, Semester, Section) are disabled for {editUserData.role === 'alumni' ? 'Alumni' : 'Campus Administrators'}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 p-3.5 bg-white border border-[#E8E1D5] rounded-2xl">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <span className="text-sm">🎓</span>
                    <span className="text-[11.5px] font-black text-[#071A35] uppercase tracking-wider">
                      Student Academic Program &amp; Class
                    </span>
                  </div>

                  {/* Program Level (Category Track) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-extrabold text-[#071A35]">
                      Program Category (Degree Level)
                    </label>
                    <select
                      value={editUserData.programCategory}
                      onChange={e => {
                        const newCategory = e.target.value;
                        const firstCourse = MINHAJ_PROGRAMS[newCategory][0];
                        setEditUserData({
                          ...editUserData,
                          programCategory: newCategory,
                          department: firstCourse,
                          semester: '1st Semester'
                        });
                      }}
                      className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-3 py-2 text-[12px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                    >
                      <option value="BS Programs">BS Programs (4-5 Years)</option>
                      <option value="Associate Degree Programs">Associate Degree Programs (ADP - 2 Years)</option>
                    </select>
                  </div>

                  {/* Specific Degree / Program (Course) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11.5px] font-extrabold text-[#071A35]">
                      Degree / Program (Course)
                    </label>
                    <select
                      value={editUserData.department}
                      onChange={e => setEditUserData({ ...editUserData, department: e.target.value })}
                      className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-3 py-2 text-[12px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35] truncate"
                    >
                      {MINHAJ_PROGRAMS[editUserData.programCategory]?.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester and Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-extrabold text-[#071A35]">Semester</label>
                      <select
                        value={editUserData.semester}
                        onChange={e => setEditUserData({ ...editUserData, semester: e.target.value })}
                        className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-2.5 py-2 text-[11.5px] font-bold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                      >
                        {(editUserData.programCategory === 'Associate Degree Programs' ? ADP_SEMESTERS : BS_SEMESTERS).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] font-extrabold text-[#071A35]">Section</label>
                      <input
                        type="text"
                        value={editUserData.section || ''}
                        onChange={e => setEditUserData({ ...editUserData, section: e.target.value })}
                        className="w-full bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl px-3 py-2 text-[12px] font-semibold text-[#071A35] focus:outline-none focus:border-[#071A35]"
                        placeholder="e.g. Section A"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-2 pt-3 border-t border-[#E8E1D5]">
                <button type="button" onClick={() => setIsEditUserModalOpen(false)} className="flex-1 bg-white border border-[#E8E1D5] text-[#071A35] py-2.5 rounded-xl text-xs font-bold hover:bg-[#F3EEE4] transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#071A35] hover:bg-[#00c2cb] hover:text-[#071A35] text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md border-none cursor-pointer">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersManager;
