/**
 * pushNotificationSetup.js
 *
 * Handles the full Web Push subscription lifecycle:
 *   1. Feature-detect service worker & push support
 *   2. Request notification permission from the user  <- FIRST, so the prompt is immediate
 *   3. Register service-worker.js
 *   4. Subscribe to the browser's push service using the VAPID public key
 *   5. POST the subscription object to the backend so it can push to this device
 *
 * Uses RELATIVE URLs so all fetches go through CRA's proxy (configured in package.json).
 * Call this once after the user is authenticated.
 */

/**
 * Converts a Base64 URL-encoded VAPID public key to a Uint8Array,
 * which is the format required by pushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Main setup function. Safe to call multiple times — bails out early
 * if a subscription already exists.
 */
export const setupPushNotifications = async () => {
  console.log("[Push] Starting push notification setup...");

  // -- 1. Feature Detection ---------------------------------------------------
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[Push] Web Push is not supported in this browser.");
    return;
  }
  console.log("[Push] Browser supports push notifications");

  // -- 2. Request Permission FIRST --------------------------------------------
  // This must happen early so the browser prompt appears while the user is active.
  // Browsers require a recent user gesture — login button click qualifies.
  const permission = await Notification.requestPermission();
  console.log("[Push] Permission response:", permission);
  if (permission !== "granted") {
    console.warn("[Push] Notification permission was not granted. Stopping.");
    return;
  }
  console.log("[Push] Notification permission granted");

  // -- 3. Register the Service Worker ----------------------------------------
  let registration;
  try {
    registration = await navigator.serviceWorker.register("/service-worker.js");
    // Wait until the service worker is fully active before subscribing
    await navigator.serviceWorker.ready;
    console.log("[Push] Service Worker registered and active:", registration.scope);
  } catch (err) {
    console.error("[Push] Service Worker registration failed:", err);
    return;
  }

  // -- 4. Check if Already Subscribed ----------------------------------------
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    console.log("[Push] Already subscribed — no action needed.");
    return;
  }

  // -- 5. Fetch the VAPID Public Key from the server (relative URL via proxy) -
  let vapidPublicKey;
  try {
    const res = await fetch("/api/users/vapid-public-key");
    console.log("[Push] VAPID key endpoint status:", res.status);
    if (!res.ok) {
      console.error("[Push] Server returned error for VAPID key:", res.status, res.statusText);
      return;
    }
    const data = await res.json();
    vapidPublicKey = data.vapidPublicKey;
    console.log("[Push] VAPID public key received");
  } catch (err) {
    console.error("[Push] Failed to fetch VAPID public key:", err.message);
    return;
  }

  // -- 6. Subscribe to the Browser's Push Service ----------------------------
  let subscription;
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log("[Push] Push subscription created");
  } catch (err) {
    console.error("[Push] Failed to create push subscription:", err);
    return;
  }

  // -- 7. Save Subscription to Backend (relative URL via proxy) ---------------
  try {
    const token = sessionStorage.getItem("token");
    const res = await fetch("/api/users/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ subscription }),
    });

    if (res.ok) {
      console.log("[Push] Push subscription saved to server successfully. System fully operational.");
    } else {
      const errData = await res.json().catch(() => ({}));
      console.error("[Push] Server rejected subscription:", res.status, errData.message);
    }
  } catch (err) {
    console.error("[Push] Failed to save subscription to server:", err);
  }
};
