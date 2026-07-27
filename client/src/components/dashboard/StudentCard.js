import React, { useState, useEffect } from 'react';
import logo from '../../assets/MUL-Logo.png';
import { getInitials } from '../../utils/helpers';

const StudentCard = ({ user, avatar }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;
  const initials = getInitials(user?.name);

  return (
    <div className="w-full min-h-[300px] h-[300px] bg-[#071A35] rounded-[1.5rem] overflow-hidden shadow-[0_12px_35px_rgba(7,26,53,0.15)] border border-[#F5B82E]/30 flex flex-col font-sans justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(7,26,53,0.3)]">
      {/* Top Header Bar */}
      <div className="bg-[#0A2246] px-5 py-2.5 flex justify-between items-center border-b border-white/10">
        <span className="text-[#F5B82E] font-black text-[13px] tracking-wider flex items-center gap-1.5 uppercase">
          <span>✦</span> STUDENT CARD
        </span>
        <span className="text-white/80 text-[11px] font-semibold">Valid Upto: Dec 2026</span>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-br from-[#071A35] via-[#0A2246] to-[#071A35] px-6 py-4 flex-1 flex items-center justify-between gap-4 relative">
        <div className="flex flex-col gap-2 w-full text-left z-[2]">
          <div className="flex items-baseline gap-3">
            <span className="text-[#F5B82E] font-extrabold text-[11.5px] min-w-[55px] uppercase tracking-wider">Name:</span>
            <span className="text-white font-black text-[15px]">{user?.name || ''}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[#F5B82E] font-extrabold text-[11.5px] min-w-[55px] uppercase tracking-wider">Reg. #:</span>
            <span className="text-white/90 font-bold text-[13px]">{user?.registeration_number || user?.registration_no || ''}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[#F5B82E] font-extrabold text-[11.5px] min-w-[55px] uppercase tracking-wider">Class:</span>
            <span className="text-white/90 font-bold text-[13px]">{user?.class || 'BS'}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[#F5B82E] font-extrabold text-[11.5px] min-w-[55px] uppercase tracking-wider">Dept:</span>
            <span className="text-white/90 font-bold text-[13px]">{user?.department || 'Computer Science'}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[#F5B82E] font-extrabold text-[11.5px] min-w-[55px] uppercase tracking-wider">Session:</span>
            <span className="text-white/90 font-bold text-[13px]">{user?.session || '2022-26 Fall'}</span>
          </div>
        </div>

        {/* Photo Frame */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="w-[95px] h-[115px] bg-[#0A2246] border-[2px] border-[#F5B82E]/60 rounded-xl overflow-hidden shadow-[0_6px_16px_rgba(0,0,0,0.3)] flex items-center justify-center">
            {showFallback ? (
              <div className="font-black text-[#F5B82E] text-3xl">
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
          <div className="text-[8px] font-extrabold text-[#F5B82E] tracking-widest uppercase">ID PHOTO</div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-[#0A2246] px-5 py-2.5 grid grid-cols-[1fr_1.5fr_1fr] items-center border-t border-white/10 text-white">
        <div className="flex flex-col items-center">
          <div className="signature-img">
            <svg width="75" height="25" viewBox="0 0 100 40">
              <path d="M10 30 Q 30 10 50 30 T 90 30" fill="none" stroke="#F5B82E" strokeWidth="1.5" />
              <path d="M20 25 L 80 25" fill="none" stroke="#F5B82E" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
          </div>
          <span className="text-[7.5px] font-black text-[#F5B82E] uppercase border-t border-white/10 -mt-1 pt-0.5">Registrar Signature</span>
        </div>
        <div className="flex items-center gap-2 justify-center border-l border-r border-white/10 px-2">
          <div className="w-8 h-8 bg-white rounded-full p-1 flex items-center justify-center shadow-md shrink-0 border border-white/30">
            <img src={logo} alt="MUL Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-[1.1] text-left">
            <span className="text-[11px] font-black text-white">Minhaj</span>
            <span className="text-[11px] font-black text-white">University</span>
            <span className="text-[9px] font-bold text-[#F5B82E]">Lahore</span>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="qr-code">
            <svg viewBox="0 0 100 100" width="38" height="38">
              <rect width="100" height="100" fill="#0A2246" />
              <rect x="10" y="10" width="20" height="20" fill="#F5B82E" />
              <rect x="15" y="15" width="10" height="10" fill="#0A2246" />
              <rect x="70" y="10" width="20" height="20" fill="#F5B82E" />
              <rect x="75" y="15" width="10" height="10" fill="#0A2246" />
              <rect x="10" y="70" width="20" height="20" fill="#F5B82E" />
              <rect x="15" y="75" width="10" height="10" fill="#0A2246" />
              <rect x="40" y="40" width="20" height="20" fill="#F5B82E" />
              <rect x="70" y="70" width="10" height="10" fill="#F5B82E" />
              <rect x="50" y="70" width="10" height="10" fill="#F5B82E" />
              <rect x="70" y="50" width="10" height="10" fill="#F5B82E" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
