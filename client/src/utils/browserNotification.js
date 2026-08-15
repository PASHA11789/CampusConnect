/**
 * browserNotification.js
 *
 * Shows a browser OS-level notification using the Notification API directly.
 * This is a LOCAL approach — no FCM, no external push service, no service worker subscription needed.
 *
 * Works when:
 *   - The tab is OPEN but the browser is minimized ✅
 *   - The tab is OPEN but user is on a different tab ✅
 *   - The browser is completely closed ❌ (requires Web Push/FCM for that)
 *
 * This is the correct approach for a localhost dev environment where FCM may be blocked.
 */

// Map of order statuses to notification content
const STATUS_NOTIFICATIONS = {
  accepted: {
    title: "Rider Found! — CampusConnect",
    icon: "/logo192.png",
  },
  preparing: {
    title: "Order Being Prepared — CampusConnect",
    icon: "/logo192.png",
  },
  ready: {
    title: "Order Ready for Pickup — CampusConnect",
    icon: "/logo192.png",
  },
  picked_up: {
    title: "Order En Route — CampusConnect",
    icon: "/logo192.png",
  },
  arrived: {
    title: "Rider Has Arrived! — CampusConnect",
    icon: "/logo192.png",
  },
  completed: {
    title: "Order Delivered! — CampusConnect",
    icon: "/logo192.png",
  },
};

/**
 * Show a browser OS notification.
 * @param {string} title  - Notification title
 * @param {string} body   - Notification body text
 * @param {string} [url]  - URL to open when clicked (defaults to current page)
 */
export const showBrowserNotification = (title, body, url = "/canteen") => {
  // Feature detect
  if (!("Notification" in window)) return;

  const show = () => {
    try {
      const n = new Notification(title, {
        body,
        icon: "/logo192.png",
        badge: "/logo192.png",
        tag: "campusconnect-order", // replaces previous notification of same tag
        renotify: true,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      // Some browsers (e.g. Firefox on Windows) require showNotification via SW
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, { body, icon: "/logo192.png", tag: "campusconnect-order" });
        });
      }
    }
  };

  if (Notification.permission === "granted") {
    show();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") show();
    });
  }
};

/**
 * Show a notification based on order status.
 * @param {string} status  - Order status string (e.g. "arrived")
 * @param {string} message - Custom message from server (used as body)
 */
export const showOrderStatusNotification = (status, message) => {
  const preset = STATUS_NOTIFICATIONS[status];
  if (!preset) return; // Unknown status — skip
  showBrowserNotification(preset.title, message || `Order status updated: ${status}`);
};
