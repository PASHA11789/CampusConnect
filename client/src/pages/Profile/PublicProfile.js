import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getInitials } from '../../utils/helpers';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import ReportModal from '../../components/ReportModal/ReportModal';

const t = (s) => s;

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [time, setTime] = useState(new Date());
  
  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) { }
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`/api/users/${id}/public`, config);
        
        if (data.success) {
          setProfile(data.profile);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();

    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [id, navigate]);



  const isDefaultAvatar = !profile?.avatar || profile.avatar.includes('ui-avatars.com');

  if (isLoading && !profile) {
    return (
      <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <Topbar time={time} user={user} setUser={setUser} avatar={user?.avatar} />
          <div className="flex-1 flex flex-col items-center justify-center gap-3.5">
            <div className="w-8 h-8 border-3 border-slate-100 border-t-[#00c2cb] rounded-full animate-spin"></div>
            <p className="font-sans text-slate-500 text-[14.5px] font-semibold">{t('Loading user profile...')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] font-sans text-slate-800 animate-fade-in">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <Topbar
          time={time}
          user={user}
          setUser={setUser}
          avatar={user?.avatar}
        />

        <div className="flex-1 px-8 py-7 flex flex-col gap-6 overflow-y-auto max-md:p-4 items-center">
          
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-10 shadow-sm mt-8 flex flex-col items-center gap-6">
            
            {error ? (
              <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl text-[13px] font-bold border border-red-100 text-center">
                {error}
              </div>
            ) : profile ? (
              <>
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#00c2cb] to-[#0079c2] p-[4px] shadow-xl">
                  {isDefaultAvatar ? (
                    <div className="w-full h-full rounded-full bg-[#0a2342] flex items-center justify-center text-[40px] font-black text-[#00c2cb] border-[5px] border-white">
                      {getInitials(profile?.displayName)}
                    </div>
                  ) : (
                    <img 
                      src={profile?.avatar} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover block bg-white border-[5px] border-white" 
                    />
                  )}
                  {/* Role Badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0a2342] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border-[3px] border-white whitespace-nowrap">
                    {profile?.role || 'Student'}
                  </div>
                </div>

                <div className="flex flex-col items-center mt-3">
                  <h1 className="text-[26px] font-black text-[#0a2342] tracking-tight">{profile?.displayName}</h1>
                  <p className="text-[14px] text-slate-500 font-medium mt-1">
                    CampusConnect Member
                  </p>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-4 pt-8 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-[20px]">🎓</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</span>
                    <span className="text-[14px] font-bold text-[#0a2342]">Verified Student</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1">
                    <span className="text-[20px]">📅</span>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Joined</span>
                    <span className="text-[14px] font-bold text-[#0a2342]">{new Date(profile?.createdAt || Date.now()).getFullYear()}</span>
                  </div>
                </div>

                {user?._id !== id && (
                  <div className="w-full mt-4 pt-6 flex flex-col items-center gap-2">
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="w-full max-w-sm py-3.5 rounded-2xl text-[13px] font-extrabold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2"
                    >
                      🛡️ Report User
                    </button>
                    <p className="text-[11px] text-slate-400 font-semibold text-center mt-2">
                      If this profile contains inappropriate content or violates academic guidelines.
                    </p>
                  </div>
                )}
              </>
            ) : null}

          </div>

          <footer className="mt-auto py-3 text-center pt-8">
            <p className="text-[12px] text-slate-400 font-medium tracking-wide">
              {t('© 2026 CampusConnect. An idea by')} <span className="text-[#0a2342] font-bold">{t('Mr. Sagheer Ahmad')}</span> &{" "}
              <span className="text-[#0a2342] font-bold">{t('Mr. Shujaat Ali Hashim')}</span>
            </p>
          </footer>
        </div>
      </main>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userId={id} 
        reportedName={profile?.displayName} 
      />
    </div>
  );
}
