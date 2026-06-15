import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';


const Topbar = ({ time, user, avatar, handleAvatarChange, isUploading }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [subView, setSubView] = useState(null); // null, 'petitions', 'forums', 'others'

  const getPetitionNotifications = () => {
    return notifications.filter(notif => {
      const model = notif.onModel || '';
      const type = notif.type || '';
      const message = (notif.message || '').toLowerCase();
      return model === 'Petition' || type === 'PETITION' || message.includes('petition') || message.includes('signature') || message.includes('milestone') || message.includes('vote');
    });
  };

  const getForumNotifications = () => {
    return notifications.filter(notif => {
      const model = notif.onModel || '';
      const type = notif.type || '';
      const message = (notif.message || '').toLowerCase();
      return model === 'Forum' || type === 'FORUM' || message.includes('forum') || message.includes('post') || message.includes('reply') || message.includes('comment');
    });
  };

  const getOtherNotifications = () => {
    const petitionIds = new Set(getPetitionNotifications().map(n => n._id));
    const forumIds = new Set(getForumNotifications().map(n => n._id));
    return notifications.filter(notif => !petitionIds.has(notif._id) && !forumIds.has(notif._id));
  };

  const unreadPetitions = getPetitionNotifications().filter(n => !n.isRead).length;
  const unreadForums = getForumNotifications().filter(n => !n.isRead).length;
  const unreadOthers = getOtherNotifications().filter(n => !n.isRead).length;

  // Reset image error state if a new avatar is uploaded or passed
  useEffect(() => {
    setImageError(false);
  }, [avatar]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/notifications', config);
      if (data.success) {
        setNotifications(data.notifications || []);
        const unread = (data.notifications || []).filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to fetch notifications in Topbar:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Establish Socket.io connection for real-time notifications
      const socket = io("http://localhost:5000");

      socket.on("connect", () => {
        socket.emit("join_user_room", user._id);
      });

      socket.on("new_notification", (notif) => {
        if (notif) {
          setNotifications(prev => [notif, ...prev].slice(0, 20));
          setUnreadCount(prev => prev + 1);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.notification-bell-container')) {
        setIsOpen(false);
        setSubView(null);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleDocumentClick);
    }
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (notif) => {
    const id = notif._id;
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/notifications/${id}/read`, {}, config);
      
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Close dropdown panel
      setIsOpen(false);

      // Determine redirection target with fallback support
      let targetPath = null;
      let navState = null;

      const model = notif.onModel || '';
      const type = notif.type || '';
      const message = (notif.message || '').toLowerCase();

      if (model === 'Forum' || type === 'FORUM' || message.includes('forum') || message.includes('post') || message.includes('reply') || message.includes('comment')) {
        targetPath = '/forum';
        if (notif.relatedItem) {
          navState = { threadId: notif.relatedItem };
        }
      } else if (model === 'Petition' || type === 'PETITION' || message.includes('petition') || message.includes('signature') || message.includes('milestone') || message.includes('vote')) {
        targetPath = '/petitions';
        if (notif.relatedItem) {
          navState = { petitionId: notif.relatedItem };
        }
      } else if (message.includes('report') || message.includes('flagged') || message.includes('moderator') || message.includes('violated')) {
        const isMod = user?.role === 'admin' || user?.role === 'student_mod';
        targetPath = isMod ? '/moderation' : '/dashboard';
      }

      if (targetPath) {
        navigate(targetPath, navState ? { state: navState } : undefined);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    try {
      const token = sessionStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await Promise.all(
        unread.map(n => axios.put(`/api/notifications/${n._id}/read`, {}, config))
      );
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Helper to extract clean initials from the user's name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'some time ago';
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PETITION':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100/60 text-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        );
      case 'FORUM':
        return (
          <div className="w-7 h-7 rounded-full bg-sky-50 border border-sky-100/60 text-sky-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100/60 text-amber-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        );
    }
  };

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;

  const getCategoryNotifications = () => {
    if (subView === 'petitions') return getPetitionNotifications();
    if (subView === 'forums') return getForumNotifications();
    if (subView === 'others') return getOtherNotifications();
    return [];
  };

  const filteredNotifications = filter === 'all' 
    ? getCategoryNotifications() 
    : getCategoryNotifications().filter(n => !n.isRead);

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-[100] animate-slide-down max-md:px-4 max-md:py-3">
      <div className="flex items-center">
        {/* Left side spacer */}
      </div>

      <div className="flex items-center gap-6">
        
        {/* Notification Bell */}
        {user && (
          <div className="relative notification-bell-container flex items-center">
            
            {/* Sliding Sub-Bells (Three Balls) */}
            <div
              className={`absolute right-full top-1/2 -translate-y-1/2 mr-3 flex items-center gap-3 transition-all duration-300 ease-out z-[99] ${
                isOpen
                  ? "opacity-100 translate-x-0 scale-100"
                  : "opacity-0 translate-x-12 scale-90 pointer-events-none"
              }`}
            >
              {/* Petitions Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('petitions')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                    subView === 'petitions'
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-emerald-50 text-emerald-500 border-emerald-100/60 hover:bg-emerald-100/50"
                  }`}
                >
                  <svg className="w-5 h-5 group-hover:animate-bell-ring transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadPetitions > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadPetitions}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 hidden group-hover:block bg-[#0a2342] text-white text-[9px] font-black py-1 px-2.5 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Petitions
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0a2342]"></div>
                </div>
              </div>

              {/* Forums Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('forums')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                    subView === 'forums'
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-sky-50 text-sky-500 border-sky-100/60 hover:bg-sky-100/50"
                  }`}
                >
                  <svg className="w-5 h-5 group-hover:animate-bell-ring transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadForums > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadForums}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 hidden group-hover:block bg-[#0a2342] text-white text-[9px] font-black py-1 px-2.5 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Forums
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0a2342]"></div>
                </div>
              </div>

              {/* Others Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('others')}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                    subView === 'others'
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-amber-50 text-amber-600 border-amber-100/60 hover:bg-amber-100/50"
                  }`}
                >
                  <svg className="w-5 h-5 group-hover:animate-bell-ring transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadOthers > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadOthers}
                    </span>
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 hidden group-hover:block bg-[#0a2342] text-white text-[9px] font-black py-1 px-2.5 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Others
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#0a2342]"></div>
                </div>
              </div>
            </div>

            {/* Main Bell Button */}
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setSubView(null);
              }}
              className={`relative p-2.5 rounded-full transition-all duration-200 cursor-pointer border flex items-center justify-center ${
                isOpen 
                  ? "bg-[#00c2cb]/10 border-[#00c2cb]/30 text-[#00c2cb]" 
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
              title="Notifications"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel (Only renders when subView is active) */}
            {isOpen && subView !== null && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-lg border border-slate-200/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[999] overflow-hidden animate-modal-slide-in flex flex-col"
              >
                <div className="flex flex-col flex-1">
                  {/* Category Details View Header */}
                  <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/20">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setSubView(null)}
                        className="text-[#00c2cb] hover:text-[#00a8b0] text-[11px] font-black border-none bg-none cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        ← Back
                      </button>
                      <span className="text-[11px] font-black text-[#0a2342] uppercase tracking-wider">
                        {subView === 'petitions' ? 'Petitions' : subView === 'forums' ? 'Forums' : 'Others'}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-[#00c2cb] hover:text-[#00a8b0] border-none bg-none cursor-pointer transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs for selected category */}
                  <div className="flex gap-2 px-4 pt-2 border-b border-slate-100 pb-2 bg-slate-50/20">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all duration-150 ${
                        filter === 'all'
                          ? 'bg-[#0a2342] text-white border-[#0a2342]'
                          : 'bg-transparent text-slate-500 border-transparent hover:text-[#0a2342]'
                      }`}
                    >
                      All ({getCategoryNotifications().length})
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all duration-150 ${
                        filter === 'unread'
                          ? 'bg-[#0a2342] text-white border-[#0a2342]'
                          : 'bg-transparent text-slate-500 border-transparent hover:text-[#0a2342]'
                      }`}
                    >
                      Unread ({getCategoryNotifications().filter(n => !n.isRead).length})
                    </button>
                  </div>

                  {/* List Container */}
                  <div className="max-h-64 overflow-y-auto scrollbar-none p-1 flex flex-col gap-0.5">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkAsRead(notif)}
                          className={`p-2.5 rounded-2xl flex gap-3 transition-all duration-200 cursor-pointer hover:bg-slate-50 items-start ${
                            !notif.isRead 
                              ? "bg-[#00c2cb]/5 border border-[#00c2cb]/10" 
                              : "bg-transparent border border-transparent"
                          }`}
                        >
                          {/* Icon */}
                          {getNotificationIcon(notif.type)}

                          {/* Message Content */}
                          <div className="flex-1 flex flex-col gap-0.5 text-left">
                            <p className={`text-[12px] leading-relaxed ${
                              !notif.isRead ? "text-slate-800 font-bold" : "text-slate-500 font-normal"
                            }`}>
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                              <svg className="w-3 h-3 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>

                          {/* Unread dot */}
                          {!notif.isRead && (
                            <div className="flex items-center self-center">
                              <div className="w-1.5 h-1.5 bg-[#00c2cb] rounded-full shrink-0 shadow-[0_0_8px_rgba(0,194,203,0.5)] animate-pulse" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-10 px-6 text-center text-slate-400 font-bold text-[12px] flex flex-col items-center justify-center gap-2.5">
                        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-[18px] text-slate-350 shadow-inner">
                          🔔
                        </div>
                        <span className="text-slate-500">All caught up!</span>
                        <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] leading-normal">
                          {filter === 'unread' ? "You have no unread notifications." : "No new notifications yet."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Info and Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[13px] font-extrabold text-[#0a2342]">{user?.name || ''}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{user?.registeration_number || user?.registration_no || ''}</span>
          </div>
          <label className="relative w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#00c2cb] to-[#0079c2] p-[2px] cursor-pointer shadow-[0_4px_10px_rgba(0,194,203,0.2)] transition-transform duration-200 hover:scale-105" title="Change avatar">
            {showFallback ? (
              <span className="w-full h-full rounded-full bg-[#0a2342] flex items-center justify-center text-base font-black text-[#00c2cb]">{getInitials(user?.name)}</span>
            ) : (
              <img 
                src={avatar} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover block bg-white" 
                onError={() => setImageError(true)} 
              />
            )}
            {isUploading && (
              <div className="absolute inset-[2px] rounded-full bg-[#0a2342]/75 flex items-center justify-center text-[#00c2cb] backdrop-blur-[1.5px] z-5">
                <div className="w-4 h-4 border-[2.5px] border-[#00c2cb]/25 border-t-[#00c2cb] rounded-full animate-spin" />
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#34d399] rounded-full border-2 border-white" />
          </label>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
