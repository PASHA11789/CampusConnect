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
    <div className="w-full max-w-[480px] min-h-[295px] h-[295px] bg-white rounded-[1.5rem] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col font-sans justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
      {/* Top Header Bar - White Background */}
      <div className="bg-white px-6 py-2.5 flex justify-between items-center border-b border-gray-100">
        <span className="text-[#D92525] font-black text-[15px] tracking-wider uppercase">
          STUDENT CARD
        </span>
      </div>

      {/* Main Content Section - Light Blue Background */}
      <div className="bg-[#0275B8] px-4 sm:px-6 py-3 sm:py-3.5 flex-1 flex items-center justify-between gap-3 sm:gap-4 relative min-w-0">
        {/* Student Info - On Left */}
        <div className="flex flex-col gap-1 sm:gap-1.5 text-left z-[2] min-w-0 flex-1 overflow-hidden">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[#7dd3fc] font-bold text-[11.5px] sm:text-[12.5px] min-w-[48px] sm:min-w-[55px] shrink-0">Name:</span>
            <span className="text-white font-extrabold text-[13px] sm:text-[14.5px] truncate leading-tight">{user?.name || 'Sagheer Ahmad'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[#7dd3fc] font-bold text-[11.5px] sm:text-[12.5px] min-w-[48px] sm:min-w-[55px] shrink-0">Reg. #:</span>
            <span className="text-white font-semibold text-[11.5px] sm:text-[12.5px] truncate leading-tight">{user?.registeration_number || user?.registration_no || '2022F-mulbscs-104'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[#7dd3fc] font-bold text-[11.5px] sm:text-[12.5px] min-w-[48px] sm:min-w-[55px] shrink-0">Class:</span>
            <span className="text-white font-semibold text-[11.5px] sm:text-[12.5px] leading-tight">{user?.class || 'BS'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[#7dd3fc] font-bold text-[11.5px] sm:text-[12.5px] min-w-[48px] sm:min-w-[55px] shrink-0">Dept.</span>
            <span className="text-white font-semibold text-[11.5px] sm:text-[12.5px] truncate leading-tight">{user?.department || 'Computer Science'}</span>
          </div>
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-[#7dd3fc] font-bold text-[11.5px] sm:text-[12.5px] min-w-[48px] sm:min-w-[55px] shrink-0">Session:</span>
            <span className="text-white font-semibold text-[11.5px] sm:text-[12.5px] leading-tight">{user?.session || '2022-26 Fall'}</span>
          </div>
        </div>

        {/* Photo Frame - On Right */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-[85px] h-[105px] sm:w-[95px] sm:h-[115px] bg-white border-2 border-white rounded-[0.85rem] sm:rounded-[1rem] overflow-hidden shadow-md flex items-center justify-center">
            {showFallback ? (
              <div className="font-black text-[#0275B8] text-2xl sm:text-3xl">
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
        </div>
      </div>

      {/* Footer Section - White Background */}
      <div className="bg-white px-5 py-2.5 grid grid-cols-[1fr_1.6fr_1fr] items-center border-t border-gray-100 text-gray-800">
        {/* Registrar Signature */}
        <div className="flex flex-col items-center">
          <div className="signature-img">

          </div>
        </div>

        {/* Center Logo & Name */}
        <div className="flex items-center gap-2.5 justify-center border-l border-r border-gray-300 px-3">
          <div className="w-10 h-10 rounded-full p-0.5 flex items-center justify-center shrink-0">
            <img src={logo} alt="MUL Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-[1.15] text-left">
            <span className="text-[13px] font-black text-[#0A2246] tracking-tight">Minhaj</span>
            <span className="text-[13px] font-black text-[#0A2246] tracking-tight">University</span>
            <span className="text-[13px] font-black text-[#0A2246] tracking-tight">Lahore</span>
          </div>
        </div>



      </div>
    </div>
  );
};

export default StudentCard;
