import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getInitials, formatDate, SOCKET_URL } from '../../utils/helpers';
import MyProfileModal from '../profile/MyProfileModal';
import CreateComplaintModal from '../complaints/CreateComplaintModal';

const Topbar = ({ time, user, avatar, handleAvatarChange, isUploading, setUser, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [subView, setSubView] = useState(null); // null, 'petitions', 'forums', 'others'
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showRestoredToast, setShowRestoredToast] = useState(false);

  const getCanteenNotifications = () => {
    return notifications.filter(notif => {
      const model = notif.onModel || '';
      const type = notif.type || '';
      const message = (notif.message || '').toLowerCase();
      return model === 'Order' || model === 'Restaurant' || type === 'CANTEEN' || type === 'ORDER' || type === 'CANTEEN_ORDER' ||
        message.includes('order') || message.includes('dispatched') || message.includes('rider') ||
        message.includes('arrived') || message.includes('canteen') || message.includes('restaurant') ||
        message.includes('delivered') || message.includes('food') || message.includes('preparing') || message.includes('placed');
    });
  };

  const getPetitionNotifications = () => {
    const canteenIds = new Set(getCanteenNotifications().map(n => n._id));
    return notifications.filter(notif => {
      if (canteenIds.has(notif._id)) return false;
      const model = notif.onModel || '';
      const type = notif.type || '';
      const message = (notif.message || '').toLowerCase();
      return model === 'Petition' || type === 'PETITION' || message.includes('petition') || message.includes('signature') || message.includes('milestone') || message.includes('vote');
    });
  };

  const getForumNotifications = () => {
    const canteenIds = new Set(getCanteenNotifications().map(n => n._id));
    return notifications.filter(notif => {
      if (canteenIds.has(notif._id)) return false;
      const model = notif.onModel || '';
      const type = notif.type || '';
      const message = (notif.message || '').toLowerCase();
      return model === 'Forum' || type === 'FORUM' || message.includes('forum') || message.includes('post') || message.includes('reply') || message.includes('comment');
    });
  };

  const getOtherNotifications = () => {
    const canteenIds = new Set(getCanteenNotifications().map(n => n._id));
    const petitionIds = new Set(getPetitionNotifications().map(n => n._id));
    const forumIds = new Set(getForumNotifications().map(n => n._id));
    return notifications.filter(notif => !canteenIds.has(notif._id) && !petitionIds.has(notif._id) && !forumIds.has(notif._id));
  };

  const unreadCanteen = getCanteenNotifications().filter(n => !n.isRead).length;
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
      const socket = io(SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      const joinUser = () => {
        const uId = user._id || user.id;
        if (uId) {
          socket.emit("join_user_room", uId.toString());
          socket.emit("join_room", uId.toString());
        }
      };

      socket.on("connect", () => {
        setIsOnline(true);
        joinUser();
      });

      socket.on("disconnect", () => {
        setIsOnline(false);
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

  // Window Network Connection Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredToast(true);
      if (typeof fetchNotifications === 'function') fetchNotifications();
      setTimeout(() => setShowRestoredToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredToast(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

      if (model === 'Order' || model === 'Restaurant' || type === 'CANTEEN' || type === 'ORDER' || message.includes('order') || message.includes('rider') || message.includes('canteen') || message.includes('dispatched') || message.includes('arrived') || message.includes('delivered')) {
        targetPath = '/canteen';
      } else if (model === 'Forum' || type === 'FORUM' || message.includes('forum') || message.includes('post') || message.includes('reply') || message.includes('comment')) {
        targetPath = '/forum';
        if (notif.relatedItem) {
          navState = { threadId: notif.relatedItem };
        }
      } else if (model === 'Petition' || type === 'PETITION' || message.includes('petition') || message.includes('signature') || message.includes('milestone') || message.includes('vote')) {
        targetPath = '/petitions';
        if (notif.relatedItem && !message.includes('reject') && !message.includes('deleted') && !message.includes('violated')) {
          navState = { petitionId: notif.relatedItem };
        }
      } else if (message.includes('report') || message.includes('flagged') || message.includes('moderator') || message.includes('violated')) {
        const isMod = user?.role === 'campus_admin' || user?.role === 'student_mod';
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

  const getNotificationIcon = (type, notif) => {
    const message = (notif?.message || '').toLowerCase();
    const model = notif?.onModel || '';
    const isCanteen = model === 'Order' || model === 'Restaurant' || type === 'CANTEEN' || type === 'ORDER' ||
      message.includes('order') || message.includes('dispatched') || message.includes('rider') ||
      message.includes('arrived') || message.includes('canteen') || message.includes('restaurant') || message.includes('delivered');

    if (isCanteen) {
      return (
        <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-100/60 text-orange-500 flex items-center justify-center shrink-0">
          <i className="fa-solid fa-burger text-xs flex items-center justify-center" />
        </div>
      );
    }
    switch (type) {
      case 'PETITION':
        return (
          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100/60 text-emerald-500 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-file-signature text-xs flex items-center justify-center" />
          </div>
        );
      case 'FORUM':
        return (
          <div className="w-7 h-7 rounded-full bg-sky-50 border border-sky-100/60 text-sky-500 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-comments text-xs flex items-center justify-center" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100/60 text-amber-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-bell text-xs flex items-center justify-center" />
          </div>
        );
    }
  };

  const getCategoryNotifications = () => {
    if (subView === 'canteen') return getCanteenNotifications();
    if (subView === 'petitions') return getPetitionNotifications();
    if (subView === 'forums') return getForumNotifications();
    if (subView === 'others') return getOtherNotifications();
    return [];
  };

  const filteredNotifications = filter === 'all'
    ? getCategoryNotifications()
    : getCategoryNotifications().filter(n => !n.isRead);

  const isDefaultAvatar = !avatar || avatar.includes('ui-avatars.com');
  const showFallback = isDefaultAvatar || imageError;

  return (
    <>
      {/* ── Network Connection Lost Floating Banner ── */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[99999] bg-amber-500 text-slate-950 px-4 py-2 text-xs font-black text-center flex items-center justify-center gap-2 shadow-xl animate-pulse">
          <i className="fa-solid fa-wifi-slash text-sm" />
          <span>Connection Lost — Internet connection dropped. Live updates paused. Attempting to reconnect...</span>
          <i className="fa-solid fa-rotate text-xs animate-spin" />
        </div>
      )}

      {/* ── Connection Restored Toast Notice ── */}
      {showRestoredToast && (
        <div className="fixed top-4 right-4 sm:right-6 z-[99999] bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl font-black text-xs border border-emerald-400 flex items-center gap-2.5 animate-slide-down">
          <i className="fa-solid fa-circle-check text-sm text-emerald-200" />
          <span>Connection Restored! Live updates are active.</span>
        </div>
      )}

      <header className="bg-white rounded-full border border-[#E8E1D5] shadow-[0_8px_30px_rgba(7,26,53,0.06)] px-3 sm:px-6 py-2 sm:py-2.5 mx-2 sm:mx-8 mt-2 sm:mt-5 mb-2 flex items-center justify-between sticky top-3 z-[100] animate-slide-down">
        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 text-[#071A35] hover:bg-[#FAF7F0] rounded-full transition-colors border-none bg-transparent cursor-pointer shrink-0"
            title="Toggle Menu"
          >
            <i className="fa-solid fa-bars text-lg text-[#071A35] flex items-center justify-center" />
          </button>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Notification Bell */}
          <div className="relative notification-bell-container flex items-center">
            {/* Sliding Sub-Bells (Four Balls: Orders, Petitions, Forums, Others) */}
            <div
              className={`absolute flex items-center gap-2 transition-all duration-300 ease-out z-[99] max-md:top-full max-md:left-1/2 max-md:mt-2.5 max-md:bg-white/95 max-md:backdrop-blur-md max-md:p-2 max-md:rounded-full max-md:shadow-xl max-md:border max-md:border-[#E8E1D5] md:right-full md:top-1/2 md:mr-2.5 ${isOpen
                  ? "opacity-100 scale-100 max-md:-translate-x-1/2 max-md:translate-y-0 md:translate-x-0 md:-translate-y-1/2"
                  : "opacity-0 scale-90 pointer-events-none max-md:-translate-x-1/2 max-md:-translate-y-2 md:translate-x-10 md:-translate-y-1/2"
                }`}
            >
              {/* Canteen / Food Orders Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('canteen')}
                  title="Canteen Orders & Delivery Notifications"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${subView === 'canteen'
                      ? "bg-[#00c2cb] text-[#071A35] border-[#00c2cb] font-bold"
                      : "bg-[#FAF7F0] text-[#211A24] border-[#E8E1D5] hover:bg-[#F3EEE4]"
                    }`}
                >
                  <i className="fa-solid fa-burger text-xs group-hover:scale-110 transition-transform flex items-center justify-center" />
                  {unreadCanteen > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D94B3D] text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadCanteen}
                    </span>
                  )}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#071A35] text-white text-[8px] font-black py-0.5 px-2 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Canteen Orders
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#071A35]"></div>
                </div>
              </div>

              {/* Petitions Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('petitions')}
                  title="Petitions Notifications"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${subView === 'petitions'
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-[#FAF7F0] text-[#2563EB] border-[#E8E1D5] hover:bg-[#F3EEE4]"
                    }`}
                >
                  <i className="fa-solid fa-file-signature text-xs group-hover:scale-110 transition-transform flex items-center justify-center" />
                  {unreadPetitions > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D94B3D] text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadPetitions}
                    </span>
                  )}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#071A35] text-white text-[8px] font-black py-0.5 px-2 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Petitions
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#071A35]"></div>
                </div>
              </div>

              {/* Forums Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('forums')}
                  title="Forums Notifications"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${subView === 'forums'
                      ? "bg-[#DCD9F7] text-[#071A35] border-[#DCD9F7] font-bold"
                      : "bg-[#FAF7F0] text-[#071A35] border-[#E8E1D5] hover:bg-[#F3EEE4]"
                    }`}
                >
                  <i className="fa-solid fa-comments text-xs group-hover:scale-110 transition-transform flex items-center justify-center" />
                  {unreadForums > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D94B3D] text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadForums}
                    </span>
                  )}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#071A35] text-white text-[8px] font-black py-0.5 px-2 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Forums
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#071A35]"></div>
                </div>
              </div>

              {/* Others Ball */}
              <div className="group relative">
                <button
                  onClick={() => setSubView('others')}
                  title="Other Notifications"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${subView === 'others'
                      ? "bg-[#00c2cb] text-[#071A35] border-[#00c2cb]"
                      : "bg-[#FAF7F0] text-[#211A24] border-[#E8E1D5] hover:bg-[#F3EEE4]"
                    }`}
                >
                  <i className="fa-solid fa-bell text-xs group-hover:animate-bell-ring transition-transform flex items-center justify-center" />
                  {unreadOthers > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#D94B3D] text-white text-[7px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                      {unreadOthers}
                    </span>
                  )}
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#071A35] text-white text-[8px] font-black py-0.5 px-2 rounded-md whitespace-nowrap shadow-md z-[1000]">
                  Others
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#071A35]"></div>
                </div>
              </div>
            </div>

            {/* Main Bell Button */}
            <button
              onClick={() => {
                setIsOpen(!isOpen);
                setSubView(null);
              }}
              className={`relative w-9 h-9 rounded-full transition-all duration-200 cursor-pointer border flex items-center justify-center ${isOpen
                  ? "bg-[#2563EB]/15 border-[#2563EB] text-[#2563EB]"
                  : "bg-white hover:bg-slate-50 border-[#E8E1D5] text-[#071A35]"
                }`}
              title="Notifications"
            >
              <i className="fa-solid fa-bell text-sm flex items-center justify-center" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Panel (Only renders when subView is active) */}
            {isOpen && subView !== null && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="md:absolute md:right-0 md:top-full md:mt-3 md:w-80 max-md:fixed max-md:top-[128px] max-md:left-3 max-md:right-3 max-md:w-auto max-md:max-w-sm max-md:mx-auto bg-white/95 backdrop-blur-lg border border-slate-200/60 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] z-[999] overflow-hidden animate-modal-slide-in flex flex-col"
              >
                <div className="flex flex-col flex-1">
                  {/* Category Details View Header */}
                  <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-100 bg-slate-50/20">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSubView(null)}
                        className="text-[#2563EB] hover:text-[#071A35] text-[11px] font-black border-none bg-none cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <i className="fa-solid fa-arrow-left text-[10px]" />
                        <span>Back</span>
                      </button>
                      <span className="text-[11px] font-black text-[#071A35] uppercase tracking-wider">
                        {subView === 'canteen' ? 'Canteen Orders' : subView === 'petitions' ? 'Petitions' : subView === 'forums' ? 'Forums' : 'Others'}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-bold text-[#2563EB] hover:text-[#071A35] border-none bg-none cursor-pointer transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs for selected category */}
                  <div className="flex gap-2 px-4 pt-2 border-b border-slate-100 pb-2 bg-slate-50/20">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all duration-150 ${filter === 'all'
                        ? 'bg-[#071A35] text-white border-[#071A35]'
                        : 'bg-transparent text-slate-500 border-transparent hover:text-[#071A35]'
                        }`}
                    >
                      All ({getCategoryNotifications().length})
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold cursor-pointer border transition-all duration-150 ${filter === 'unread'
                        ? 'bg-[#071A35] text-white border-[#071A35]'
                        : 'bg-transparent text-slate-500 border-transparent hover:text-[#071A35]'
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
                          className={`p-2.5 rounded-2xl flex gap-3 transition-all duration-200 cursor-pointer hover:bg-slate-50 items-start ${!notif.isRead
                            ? "bg-[#2563EB]/5 border border-[#2563EB]/10"
                            : "bg-transparent border border-transparent"
                            }`}
                        >
                          {/* Icon */}
                          {getNotificationIcon(notif.type, notif)}

                          {/* Message Content */}
                          <div className="flex-1 flex flex-col gap-0.5 text-left">
                            <p className={`text-[12px] leading-relaxed ${!notif.isRead ? "text-slate-800 font-bold" : "text-slate-500 font-normal"
                              }`}>
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                              <i className="fa-solid fa-clock text-[10px] text-slate-400 flex items-center justify-center" />
                              {formatDate(notif.createdAt)}
                            </span>
                          </div>

                          {/* Unread dot */}
                          {!notif.isRead && (
                            <div className="flex items-center self-center">
                              <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full shrink-0 animate-pulse" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-10 px-6 text-center text-slate-400 font-bold text-[12px] flex flex-col items-center justify-center gap-2.5">
                        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-350 shadow-inner">
                          <i className="fa-solid fa-bell text-[18px] text-slate-400 flex items-center justify-center" />
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

          {/* Suggestion & Complaint Button */}
          <div className="group relative">
            <button
              onClick={() => setIsComplaintModalOpen(true)}
              className="w-9 h-9 rounded-full bg-[#FAF7F0] hover:bg-[#F3EEE4] text-[#071A35] border border-[#E8E1D5] hover:border-[#00c2cb] transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-95 flex items-center justify-center"
              title="Submit Suggestion or Complaint"
            >
              <i className="fa-solid fa-comment-dots text-[#071A35] group-hover:text-[#00c2cb] transition-colors text-sm flex items-center justify-center" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-[#071A35] text-white text-[8px] font-black py-0.5 px-2 rounded-md whitespace-nowrap shadow-md z-[1000]">
              Submit Feedback
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#071A35]"></div>
            </div>
          </div>

          {/* User Info and Avatar */}
          <button
            onClick={() => setIsMyProfileOpen(true)}
            className="flex items-center gap-2 sm:gap-3 bg-[#FAF7F0] hover:bg-[#F3EEE4] p-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#E8E1D5] hover:border-[#D5CDBF] transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-98 group border-none"
            title="Click to view My Profile & Digital ID"
          >
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[12.5px] font-extrabold text-[#071A35] leading-tight group-hover:text-[#2563EB] transition-colors">{user?.name || ''}</span>
              <span className="text-[9.5px] text-[#211A24]/60 font-semibold leading-tight">{user?.registeration_number || user?.registration_no || ''}</span>
            </div>
            <div className="relative w-9 h-9 rounded-full bg-[#DCD9F7] p-[1.5px] transition-transform duration-200 group-hover:scale-105 shadow-sm flex items-center justify-center shrink-0">
              {showFallback ? (
                <span className="w-full h-full rounded-full bg-[#DCD9F7] flex items-center justify-center text-[12px] font-extrabold text-[#071A35]">{getInitials(user?.name)}</span>
              ) : (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover block bg-white"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </button>
        </div>

        <MyProfileModal
          isOpen={isMyProfileOpen}
          onClose={() => setIsMyProfileOpen(false)}
          user={user}
          onUpdateUser={(updatedUser) => {
            if (setUser) {
              setUser(updatedUser);
            }
            // Update local session storage
            const userStr = sessionStorage.getItem("user");
            if (userStr) {
              try {
                const parsed = JSON.parse(userStr);
                sessionStorage.setItem("user", JSON.stringify({ ...parsed, ...updatedUser }));
              } catch (e) { }
            }
          }}
        />
        {/* Complaint Modal */}
        {isComplaintModalOpen && (
          <CreateComplaintModal
            isOpen={isComplaintModalOpen}
            onClose={() => setIsComplaintModalOpen(false)}
            user={user}
          />
        )}
      </header>
    </>
  );
};

export default Topbar;
