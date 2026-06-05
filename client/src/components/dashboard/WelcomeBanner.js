import React, { useState, useEffect } from 'react';
import logo from '../../assets/MUL-Logo.png';

const IconForum     = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>;
const IconPetitions = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>;
const IconBell      = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;

const WelcomeBanner = ({ user, avatar }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when avatar prop changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Helper to extract clean initials from the user's name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;
  const initials = getInitials(user?.name);

  return (
    <div className="flex gap-6 w-full max-[1100px]:flex-col">
      <div className="flex-[1.4] max-w-[600px] max-[1100px]:max-w-full">
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col font-sans h-full">
          {/* Top Header Bar */}
          <div className="bg-neutral-50 px-4 py-2 flex justify-between items-center border-b border-gray-100">
            <span className="text-[#C62828] font-extrabold text-[14px] tracking-wider">STUDENT CARD</span>
            <span className="text-neutral-600 text-[11px] font-semibold">Valid Upto: Dec 2026</span>
          </div>

          {/* Main Content Section */}
          <div className="bg-gradient-to-br from-[#00838F] to-[#00acc1] px-7 py-6 flex-1 flex items-center gap-6 relative">
            <div className="flex flex-col gap-2 w-full z-[2]">
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Name:</span>
                <span className="text-white font-bold text-base">{user?.name || ''}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Reg. #:</span>
                <span className="text-white font-bold text-base">{user?.registeration_number || user?.registration_no || ''}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Class:</span>
                <span className="text-white font-bold text-base">{user?.class || 'BS'}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Dept:</span>
                <span className="text-white font-bold text-base">{user?.department || 'Computer Science'}</span>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-[#E0F2F1] font-semibold text-[13px] min-w-[60px]">Session:</span>
                <span className="text-white font-bold text-base">{user?.session || '2022-26 Fall'}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-[100px] h-[120px] bg-white border-[3px] border-[#E0F2F1] rounded-lg overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center">
                {showFallback ? (
                  <div 
                    className="font-black text-[#00838F]" 
                    style={{ fontSize: initials.length > 1 ? '36px' : '48px' }}
                  >
                    {initials}
                  </div>
                ) : (
                  <img 
                    src={avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)} 
                  />
                )}
              </div>
              <div className="text-[8px] font-extrabold text-[#E0F2F1] tracking-widest">ID PHOTO</div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="bg-white px-5 py-3 grid grid-cols-[1fr_1.5fr_1fr] items-center border-t border-gray-100 max-[600px]:grid-cols-2">
            <div className="flex flex-col items-center">
              <div className="signature-img">
                <svg width="80" height="30" viewBox="0 0 100 40">
                  <path d="M10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="#001529" strokeWidth="1.5" />
                  <path d="M20 25 L 80 25" fill="none" stroke="#001529" strokeWidth="0.5" strokeDasharray="2,2" />
                </svg>
              </div>
              <span className="text-[8px] font-extrabold text-[#001529] uppercase border-t border-gray-200 -mt-1">Registrar Signature</span>
            </div>
            <div className="flex items-center gap-2.5 justify-center border-l border-r border-gray-100">
              <div className="footer-logo-wrap">
                <img src={logo} alt="MUL Logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col leading-[1.1]">
                <span className="text-[12px] font-black text-[#001529]">Minhaj</span>
                <span className="text-[12px] font-black text-[#001529]">University</span>
                <span className="text-[12px] font-black text-[#001529]">Lahore</span>
              </div>
            </div>
            <div className="flex justify-end max-[600px]:hidden">
              <div className="qr-code">
                <svg viewBox="0 0 100 100" width="45" height="45">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="20" height="20" fill="black" />
                  <rect x="15" y="15" width="10" height="10" fill="white" />
                  <rect x="70" y="10" width="20" height="20" fill="black" />
                  <rect x="75" y="15" width="10" height="10" fill="white" />
                  <rect x="10" y="70" width="20" height="20" fill="black" />
                  <rect x="15" y="75" width="10" height="10" fill="white" />
                  <rect x="40" y="40" width="20" height="20" fill="black" />
                  <rect x="70" y="70" width="10" height="10" fill="black" />
                  <rect x="50" y="70" width="10" height="10" fill="black" />
                  <rect x="70" y="50" width="10" height="10" fill="black" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Side Panel */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-5 flex flex-col shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="mb-4 pb-3 border-b border-slate-100">
          <span className="text-[15px] font-black text-[#0a2342] uppercase tracking-wider">Notifications</span>
        </div>
        <div className="flex flex-col gap-3">
          {/* Forum */}
          <div className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer border border-transparent hover:translate-x-1 hover:bg-slate-50 hover:border-slate-200" title="Forum Notifications">
            <div className="relative w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 bg-violet-400/10 text-violet-400">
              <IconForum/>
              <span className="absolute -top-1 -right-1 bg-red-400 text-white text-[9px] font-extrabold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white">5</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800">Forums</span>
              <span className="text-[11px] text-slate-400 font-medium">New replies in your threads</span>
            </div>
          </div>

          {/* Petitions */}
          <div className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer border border-transparent hover:translate-x-1 hover:bg-slate-50 hover:border-slate-200" title="Petition Notifications">
            <div className="relative w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 bg-emerald-400/10 text-emerald-400">
              <IconPetitions/>
              <span className="absolute -top-1 -right-1 bg-red-400 text-white text-[9px] font-extrabold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white">2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800">Petitions</span>
              <span className="text-[11px] text-slate-400 font-medium">2 petitions need your vote</span>
            </div>
          </div>

          {/* Updates */}
          <div className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] cursor-pointer border border-transparent hover:translate-x-1 hover:bg-slate-50 hover:border-slate-200" title="General Updates">
            <div className="relative w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 bg-[#00c2cb]/10 text-[#00c2cb]">
              <IconBell/>
              <span className="absolute -top-1 -right-1 bg-red-400 text-white text-[9px] font-extrabold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-white">12</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800">Updates</span>
              <span className="text-[11px] text-slate-400 font-medium">University announcements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;

