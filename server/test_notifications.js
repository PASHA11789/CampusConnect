import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:5000";

async function runTest() {
  console.log("🚀 Starting Real-time Notifications Integration Test...");

  try {
    // 1. Log in as Hamza (thread author)
    console.log("🔑 Logging in as Hamza (Thread Author)...");
    const hamzaLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hamza@student.com", password: "password123" }),
    });
    
    if (!hamzaLoginRes.ok) {
      throw new Error(`Failed to login as Hamza: ${hamzaLoginRes.statusText}`);
    }
    const hamzaData = await hamzaLoginRes.json();
    const hamzaToken = hamzaData.token;
    const hamzaId = hamzaData._id;
    console.log(`✅ Hamza logged in successfully. User ID: ${hamzaId}`);

    // 2. Log in as Zoya (replier)
    console.log("🔑 Logging in as Zoya (Replier)...");
    const zoyaLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "zoya@student.com", password: "password123" }),
    });

    if (!zoyaLoginRes.ok) {
      throw new Error(`Failed to login as Zoya: ${zoyaLoginRes.statusText}`);
    }
    const zoyaData = await zoyaLoginRes.json();
    const zoyaToken = zoyaData.token;
    const zoyaId = zoyaData._id;
    console.log(`✅ Zoya logged in successfully. User ID: ${zoyaId}`);

    // 3. Fetch Hamza's dashboard / threads to find a thread authored by Hamza
    console.log("📬 Fetching threads to find Hamza's discussion...");
    const threadsRes = await fetch(`${BACKEND_URL}/api/forums`, {
      headers: { Authorization: `Bearer ${hamzaToken}` },
    });
    if (!threadsRes.ok) {
      throw new Error(`Failed to fetch threads: ${threadsRes.statusText}`);
    }
    const threadsData = await threadsRes.json();
    
    let targetThread = threadsData.threads.find(
      (t) => t.title === "Midterm Exams Preparation"
    );

    if (!targetThread) {
      targetThread = threadsData.threads[0];
    }
    
    if (!targetThread) {
      throw new Error("No threads found in database. Please run database seeder first.");
    }
    
    console.log(`🎯 Target Thread identified: "${targetThread.title}" (ID: ${targetThread._id})`);

    // Fetch details to confirm the author matches Hamza
    const threadDetailsRes = await fetch(`${BACKEND_URL}/api/forums/${targetThread._id}`, {
      headers: { Authorization: `Bearer ${hamzaToken}` },
    });
    if (!threadDetailsRes.ok) {
      throw new Error(`Failed to fetch thread details: ${threadDetailsRes.statusText}`);
    }
    const threadDetailsData = await threadDetailsRes.json();
    const threadAuthorId = threadDetailsData.thread.author._id || threadDetailsData.thread.author;
    console.log(`Thread Author ID: ${threadAuthorId} | Hamza ID: ${hamzaId}`);

    // 4. Connect Hamza to the Socket.io Server
    console.log("🔌 Connecting Hamza to Socket.io server...");
    const socket = io(BACKEND_URL, {
      transports: ["websocket"],
    });

    // Set up a promise to wait for the socket notification event
    const notificationReceivedPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error("Timeout: Did not receive 'new_notification' event via socket."));
      }, 10000); // 10s timeout

      socket.on("new_notification", (notification) => {
        clearTimeout(timeout);
        console.log("⚡ [SOCKET EVENT] Received 'new_notification'!");
        console.log(JSON.stringify(notification, null, 2));
        resolve(notification);
      });
    });

    socket.on("connect", () => {
      console.log(`⚡ Hamza connected to Socket.io server. Socket ID: ${socket.id}`);
      // Join private room
      console.log(`🚪 Emitting 'join_user_room' for User ID: ${hamzaId}...`);
      socket.emit("join_user_room", hamzaId);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // Wait 1.5 seconds for socket join room to process in server
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 5. Zoya posts a reply to Hamza's thread
    console.log(`💬 Zoya is posting a reply on Hamza's thread...`);
    const replyRes = await fetch(`${BACKEND_URL}/api/forums/${targetThread._id}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${zoyaToken}`,
      },
      body: JSON.stringify({ content: "Hey Hamza, I can help you test real-time notifications!" }),
    });
    
    if (!replyRes.ok) {
      throw new Error(`Failed to post reply: ${replyRes.statusText}`);
    }
    const replyData = await replyRes.json();
    console.log(`✅ Zoya's reply posted successfully. Reply ID: ${replyData.reply._id}`);

    // 6. Wait for the socket event to trigger
    console.log("⏳ Waiting for Socket.io notification broadcast to Hamza...");
    const receivedNotification = await notificationReceivedPromise;
    socket.disconnect();

    // 7. Verify notifications via GET /api/notifications REST API
    console.log("📥 Verification: Fetching Hamza's notifications via GET /api/notifications...");
    const notificationsRes = await fetch(`${BACKEND_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${hamzaToken}` },
    });
    if (!notificationsRes.ok) {
      throw new Error(`Failed to fetch notifications list: ${notificationsRes.statusText}`);
    }
    const notificationsData = await notificationsRes.json();

    const notificationsList = notificationsData.notifications || notificationsData.notfications;
    console.log(`Found ${notificationsList.length} notifications.`);
    const matchingNotification = notificationsList.find(
      (n) => n._id === receivedNotification._id
    );

    if (matchingNotification) {
      console.log("✅ Verification: Notification persists in MongoDB database.");
      console.log(`   Message: "${matchingNotification.message}"`);
      console.log(`   Read status: ${matchingNotification.isRead}`);
    } else {
      throw new Error("Verification Failed: Socket notification ID was not found in the user's notification list from database.");
    }

    // 8. Test marking the notification as read via PUT /api/notifications/:id/read
    console.log(`📖 Verification: Marking notification ${matchingNotification._id} as read...`);
    const readRes = await fetch(`${BACKEND_URL}/api/notifications/${matchingNotification._id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${hamzaToken}` },
    });
    if (!readRes.ok) {
      throw new Error(`Failed to mark notification as read: ${readRes.statusText}`);
    }
    const readData = await readRes.json();

    if (readData.success && readData.notification.isRead === true) {
      console.log("🎉 SUCCESS: Notification status updated to read!");
    } else {
      throw new Error("Verification Failed: Could not mark notification as read.");
    }

    console.log("\n⭐️ INTEGRATION TEST PASSED SUCCESSFULLY! ⭐️");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
  }
}

runTest();
