export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
};

export const formatDate = (date, t = (s) => s) => {
  if (!date) return t('some time ago');
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return t('Just now');
  if (diff < 3600) return t(`${Math.floor(diff / 60)}m ago`);
  if (diff < 86400) return t(`${Math.floor(diff / 3600)}h ago`);
  return t(`${Math.floor(diff / 86400)}d ago`);
};

export const getAvatarColor = (name) => {
  const colors = [
    { bg: '#e0f2fe', text: '#0369a1' }, // Blue
    { bg: '#dcfce7', text: '#15803d' }, // Green
    { bg: '#ffedd5', text: '#c2410c' }, // Orange
    { bg: '#f3e8ff', text: '#6b21a8' }, // Purple
    { bg: '#fce7f3', text: '#be185d' }, // Pink
    { bg: '#e0f7fa', text: '#006064' }, // Teal
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return window.location.origin;
};

export const SOCKET_URL = getSocketUrl();
