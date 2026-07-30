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
    <div className="w-full min-h-[300px] h-[300px] bg-white rounded-[1.5rem] overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.15)] border border-gray-200 flex flex-col font-sans justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
      {/* Top Header Bar - White Background */}
      <div className="bg-white px-6 py-2.5 flex justify-between items-center border-b border-gray-100">
        <span className="text-[#D92525] font-black text-[15px] tracking-wider uppercase">
          STUDENT CARD
        </span>
      </div>

      {/* Main Content Section - Light Blue Background */}
      <div className="bg-[#0275B8] px-6 py-3.5 flex-1 flex items-center justify-start gap-5 relative">
        {/* Photo Frame - On Left */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-[100px] h-[120px] bg-white border-2 border-white rounded-[1rem] overflow-hidden shadow-md flex items-center justify-center">
            {showFallback ? (
              <div className="font-black text-[#0275B8] text-3xl">
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

        {/* Student Info - On Right */}
        <div className="flex flex-col gap-1.5 text-left z-[2] overflow-hidden">
          <div className="flex items-baseline gap-2">
            <span className="text-[#7dd3fc] font-bold text-[13px] min-w-[62px]">Name:</span>
            <span className="text-white font-extrabold text-[15px] truncate">{user?.name || 'Sagheer Ahmad'}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#7dd3fc] font-bold text-[13px] min-w-[62px]">Reg. #:</span>
            <span className="text-white font-semibold text-[13px] truncate">{user?.registeration_number || user?.registration_no || '2022F-mulbscs-104'}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#7dd3fc] font-bold text-[13px] min-w-[62px]">Class:</span>
            <span className="text-white font-semibold text-[13px]">{user?.class || 'BS'}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#7dd3fc] font-bold text-[13px] min-w-[62px]">Dept.</span>
            <span className="text-white font-semibold text-[13px] truncate">{user?.department || 'Computer Science'}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#7dd3fc] font-bold text-[13px] min-w-[62px]">Session:</span>
            <span className="text-white font-semibold text-[13px]">{user?.session || '2022-26 Fall'}</span>
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
