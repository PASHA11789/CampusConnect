import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../utils/helpers';

const DisciplinaryWarningModal = () => {
  const [warning, setWarning] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!userStr) return;

    let user;
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      return;
    }

    if (!user || !user._id) return;

    // Check if user has active warning initially
    if (user.activeWarning && user.activeWarning.hasWarning && !user.activeWarning.acknowledged) {
      setWarning(user.activeWarning);
      setIsOpen(true);
    }

    // Connect socket for real-time disciplinary warning popup
    const socket = io(SOCKET_URL);
    socket.on('connect', () => {
      socket.emit('join_room', `user_${user._id}`);
    });

    socket.on(`user_warned_${user._id}`, (data) => {
      setWarning(data);
      setIsOpen(true);
      
      // Update local storage user profile avatar if sanitized
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=071A35&color=00c2cb`;
      user.activeWarning = data;
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleAcknowledge = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (token) {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put('/api/users/acknowledge-warning', {}, config);
      }
      
      // Update stored user object
      const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.activeWarning) {
          user.activeWarning.acknowledged = true;
          user.activeWarning.hasWarning = false;
        }
        sessionStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Failed to acknowledge warning:', error);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !warning) return null;

  return createPortal(
    <div className="fixed inset-0 bg-[#071A35]/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-modal-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-red-500 shadow-[0_25px_60px_rgba(225,29,72,0.3)] overflow-hidden animate-modal-slide-in text-left">
        
        {/* Aggressive Red Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-5 flex items-center gap-3.5 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl animate-pulse shrink-0 border border-white/20">
            <i className="fa-solid fa-triangle-exclamation" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-black tracking-widest uppercase bg-black/20 px-2.5 py-0.5 rounded-full w-fit mb-1 border border-white/10">
              MINHAJ UNIVERSITY DISCIPLINARY OFFICE
            </span>
            <h2 className="text-[18px] font-black text-white m-0 leading-snug">
              Official Disciplinary Warning Notice
            </h2>
          </div>
        </div>

        {/* Warning Content */}
        <div className="p-6 flex flex-col gap-4 bg-[#FAF7F0]">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col gap-1.5 text-left">
            <span className="text-[10.5px] font-black text-rose-600 uppercase tracking-wider">Violation Reason</span>
            <strong className="text-[14px] font-black text-[#071A35]">
              {warning.reason || "Obscene Profile Image / Community Guidelines Violation"}
            </strong>
            <p className="text-[12.5px] font-semibold text-slate-700 leading-relaxed m-0 pt-1">
              {warning.details || "Your profile image or username was flagged as explicit or offensive. Campus Administration has reset your avatar to default."}
            </p>
          </div>

          <div className="bg-white border border-[#E8E1D5] p-4 rounded-2xl text-[12px] font-semibold text-slate-600 flex flex-col gap-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400">
              <span>Issued By: <strong className="text-[#071A35]">{warning.issuedBy || "Joint Mod Office"}</strong></span>
              <span>{warning.issuedAt ? new Date(warning.issuedAt).toLocaleDateString() : 'Today'}</span>
            </div>
            <p className="m-0 pt-2 text-slate-700 leading-normal flex items-start gap-1.5">
              <i className="fa-solid fa-triangle-exclamation text-amber-500 text-xs mt-0.5 shrink-0" />
              <span>Please maintain appropriate campus decorum. Further policy violations may result in account suspension and referral to the Academic Disciplinary Board.</span>
            </p>
          </div>

          <button
            onClick={handleAcknowledge}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-red-500/25 cursor-pointer border-none disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Processing..." : "I Understand & Agree to Guidelines"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DisciplinaryWarningModal;
