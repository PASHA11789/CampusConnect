/**
 * CampusConnect Service Worker
 * Handles Web Push Notifications received from the server.
 * This file runs independently in the browser background — even when the tab is closed.
 */

// ── Push Event ────────────────────────────────────────────────────────────────
// Fired when the server sends a push message via web-push (webPush.sendNotification).
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "CampusConnect", body: event.data.text(), url: "/" };
  }

  const title = data.title || "CampusConnect";
  const options = {
    body: data.body || "You have a new notification.",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "campusconnect-notification", // Replaces previous same-tag notification
    renotify: true,
    data: {
      url: data.url || "/",
    },
  };

  // waitUntil keeps the service worker alive until the notification is shown
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification Click Event ──────────────────────────────────────────────────
// When the user taps the notification, open/focus the relevant page.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open in a tab, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
