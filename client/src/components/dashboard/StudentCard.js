import React, { useState, useEffect } from 'react';
import logo from '../../assets/MUL-Logo.png';
import { getInitials } from '../../utils/helpers';

const StudentCard = ({ user, avatar }) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state when avatar prop changes
  useEffect(() => {
    setImageError(false);
  }, [avatar]);



  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;
  const initials = getInitials(user?.name);

  return (
    <div className="w-full h-[290px] min-h-[290px] bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col font-sans">
      {/* Top Header Bar */}
      <div className="bg-neutral-50 px-4 py-2 flex justify-between items-center border-b border-gray-100">
        <span className="text-[#C62828] font-extrabold text-[14px] tracking-wider">STUDENT CARD</span>
        <span className="text-neutral-600 text-[11px] font-semibold">Valid Upto: Dec 2026</span>
      </div>

      {/* Main Content Section */}
      <div className="bg-gradient-to-br from-[#00838F] to-[#00acc1] px-7 py-4 md:py-5 flex-1 flex items-center gap-6 relative">
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
  );
};

export default StudentCard;
