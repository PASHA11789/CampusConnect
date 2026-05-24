// Standalone test script using Node's native global fetch (Node 18+)

async function runTest() {
  console.log("🚀 Starting Real-time Socket.io Forum Update Test...");

  const loginUrl = 'http://localhost:5000/api/auth/login';
  const forumUrl = 'http://localhost:5000/api/forums';

  try {
    // 1. Authenticate as a dummy user (Zoya Sheikh)
    console.log("📡 Step 1: Logging in as Zoya Sheikh (zoya@student.com)...");
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'zoya@student.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed with status ${loginResponse.status}: ${errorText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log(`✅ Login successful! Token retrieved: ${token.substring(0, 15)}...`);

    // 2. Publish a new discussion thread
    console.log("\n📡 Step 2: Creating a new discussion thread to trigger real-time updates...");
    const threadTitle = `Live update test: ${new Date().toLocaleTimeString()}`;
    const threadContent = "This thread was generated dynamically by the Antigravity assistant to test Socket.io live updates on the student forum widget!";

    const forumResponse = await fetch(forumUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: threadTitle,
        content: threadContent
      })
    });

    if (!forumResponse.ok) {
      const errorText = await forumResponse.text();
      throw new Error(`Thread creation failed with status ${forumResponse.status}: ${errorText}`);
    }

    const forumData = await forumResponse.json();
    console.log("✅ Discussion thread published successfully!");
    console.log("Server response:", JSON.stringify(forumData, null, 2));
    console.log("\n🎉 Real-time websocket event broadcasted! Please check your browser to confirm the Student Forums widget updated instantly.");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

runTest();
