import webPush from "web-push";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "BNo_Example_Public_Key_For_Development_Purposes_Only_Replace_In_Env";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "Example_Private_Key_For_Development_Replace_In_Env";
const vapidMailto = process.env.VAPID_MAILTO || "mailto:admin@campusconnect.edu";

try {
  webPush.setVapidDetails(vapidMailto, vapidPublicKey, vapidPrivateKey);
} catch (error) {
  console.warn("Web push VAPID setup notice:", error.message);
}

/**
 * Helper to send a Web Push notification to a user document or pushSubscription object
 */
export const sendWebPushNotification = async (pushSubscription, payload) => {
  if (!pushSubscription) return false;
  try {
    const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);
    await webPush.sendNotification(pushSubscription, payloadString);
    return true;
  } catch (error) {
    console.error("Error sending Web Push notification:", error.message);
    return false;
  }
};
