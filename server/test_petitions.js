import { io } from "socket.io-client";

const BACKEND_URL = "http://127.0.0.1:5000";

async function runTest() {
  console.log("🚀 Starting Petitions End-to-End Integration Test...");

  try {
    // 1. Log in as Hamza (Student)
    console.log("\n🔑 Logging in as Hamza (Student)...");
    const hamzaLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hamza@student.com", password: "password123" }),
    });
    if (!hamzaLoginRes.ok) throw new Error(`Failed to login as Hamza: ${hamzaLoginRes.statusText}`);
    const hamzaData = await hamzaLoginRes.json();
    const hamzaToken = hamzaData.token;
    const hamzaId = hamzaData._id;
    console.log(`✅ Hamza logged in. ID: ${hamzaId}`);

    // 2. Log in as Shujaat (Student Mod)
    console.log("\n🔑 Logging in as Shujaat (Moderator)...");
    const modLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "shujaat@mod.com", password: "password123" }),
    });
    if (!modLoginRes.ok) throw new Error(`Failed to login as Moderator: ${modLoginRes.statusText}`);
    const modData = await modLoginRes.json();
    const modToken = modData.token;
    const modId = modData._id;
    console.log(`✅ Shujaat logged in. ID: ${modId}`);

    // 3. Log in as Zoya (Student 2)
    console.log("\n🔑 Logging in as Zoya (Student 2)...");
    const zoyaLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "zoya@student.com", password: "password123" }),
    });
    if (!zoyaLoginRes.ok) throw new Error(`Failed to login as Zoya: ${zoyaLoginRes.statusText}`);
    const zoyaData = await zoyaLoginRes.json();
    const zoyaToken = zoyaData.token;
    const zoyaId = zoyaData._id;
    console.log(`✅ Zoya logged in. ID: ${zoyaId}`);

    // 4. Connect Hamza & Mod to Socket.io to test live updates
    console.log("\n🔌 Connecting test sockets to Socket.io server...");
    const hamzaSocket = io(BACKEND_URL, { transports: ["websocket"] });
    const modSocket = io(BACKEND_URL, { transports: ["websocket"] });

    // Store received socket events to verify later
    const socketEvents = {
      newPetitionPending: [],
      newPetitionPublished: [],
      petitionSigned: [],
    };

    hamzaSocket.on("connect", () => {
      hamzaSocket.emit("join_room", "BSCS-Computer Science-4-A");
    });
    modSocket.on("connect", () => {
      modSocket.emit("join_room", "mod_room");
    });

    modSocket.on("new_petition_pending", (data) => {
      console.log("⚡ [SOCKET EVENT] Moderator received 'new_petition_pending':", data);
      socketEvents.newPetitionPending.push(data);
    });

    hamzaSocket.on("new_petition_published", (data) => {
      console.log("⚡ [SOCKET EVENT] Class Room received 'new_petition_published':", data.title);
      socketEvents.newPetitionPublished.push(data);
    });

    hamzaSocket.on("petition_signed", (data) => {
      console.log("⚡ [SOCKET EVENT] Public received 'petition_signed':", data);
      socketEvents.petitionSigned.push(data);
    });

    // Wait a brief moment for sockets to connect and join rooms
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 5. Test GET /api/petitions (fetch initial list)
    console.log("\n📥 Fetching petitions for Hamza...");
    const getRes = await fetch(`${BACKEND_URL}/api/petitions`, {
      headers: { Authorization: `Bearer ${hamzaToken}` },
    });
    if (!getRes.ok) throw new Error(`Failed to fetch petitions: ${getRes.statusText}`);
    const getData = await getRes.json();
    console.log(`✅ Initial petitions count: ${getData.count}`);

    // 6. Test POST /api/petitions (Create Class Petition - Instantly Active)
    console.log("\n📝 Creating Class Petition (should publish instantly)...");
    const classPetRes = await fetch(`${BACKEND_URL}/api/petitions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hamzaToken}`,
      },
      body: JSON.stringify({
        title: "Extend Class Breaks",
        description: "We need longer breaks between lectures to move between buildings.",
        level: "Class",
        milestone: 2,
      }),
    });
    if (!classPetRes.ok) throw new Error(`Failed to create class petition: ${classPetRes.statusText}`);
    const classPetData = await classPetRes.json();
    console.log(`✅ Class Petition created! Status: ${classPetData.petition.status}`);
    const classPetitionId = classPetData.petition._id;

    // 7. Test POST /api/petitions (Create Department Petition - Needs Mod Approval)
    console.log("\n📝 Creating Department Petition (should require approval)...");
    const deptPetRes = await fetch(`${BACKEND_URL}/api/petitions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hamzaToken}`,
      },
      body: JSON.stringify({
        title: "Upgrade CS Lab PCs",
        description: "We need faster SSDs and more RAM in the CS labs.",
        level: "Department",
        milestone: 3,
      }),
    });
    if (!deptPetRes.ok) throw new Error(`Failed to create department petition: ${deptPetRes.statusText}`);
    const deptPetData = await deptPetRes.json();
    console.log(`✅ Department Petition created! Message: ${deptPetData.message}`);
    const pendingPetitionId = deptPetData.petition._id;

    // Wait a moment for socket events to propagate
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 8. Verify Socket.io: Mod received 'new_petition_pending' and Hamza received 'new_petition_published'
    if (socketEvents.newPetitionPending.some((p) => p.petitionId === pendingPetitionId)) {
      console.log("✅ Socket Verification: Moderator was notified of pending petition!");
    } else {
      throw new Error("Socket Verification Failed: Moderator was not notified of pending petition.");
    }

    if (socketEvents.newPetitionPublished.some((p) => p._id === classPetitionId)) {
      console.log("✅ Socket Verification: Class room was notified of instantly published petition!");
    } else {
      throw new Error("Socket Verification Failed: Class room was not notified of instantly published petition.");
    }

    // 9. Test PUT /api/petitions/:id/moderate (Negative Test: Student cannot moderate)
    console.log("\n🚫 Negative Test: Regular student attempts to approve the petition...");
    const badModRes = await fetch(`${BACKEND_URL}/api/petitions/${pendingPetitionId}/moderate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hamzaToken}`,
      },
      body: JSON.stringify({ action: "Approve" }),
    });
    console.log(`Response Status: ${badModRes.status} (Expected: 403)`);
    if (badModRes.status !== 403) {
      throw new Error("Security check failed: Regular student was allowed to moderate a petition!");
    }
    console.log("✅ Security check passed. Regular student forbidden from moderating.");

    // 10. Test PUT /api/petitions/:id/moderate (Positive Test: Moderator approves)
    console.log("\n👮 Positive Test: Moderator approves the petition...");
    const goodModRes = await fetch(`${BACKEND_URL}/api/petitions/${pendingPetitionId}/moderate`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${modToken}`,
      },
      body: JSON.stringify({ action: "Approve" }),
    });
    if (!goodModRes.ok) throw new Error(`Moderator failed to approve: ${goodModRes.statusText}`);
    const goodModData = await goodModRes.json();
    console.log(`✅ Moderator approval response: ${goodModData.message}`);

    // 11. Test PUT /api/petitions/:id/sign (Sign approved/active petition)
    console.log("\n✍️ Zoya is signing the newly approved department petition...");
    const signRes = await fetch(`${BACKEND_URL}/api/petitions/${pendingPetitionId}/sign`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${zoyaToken}` },
    });
    if (!signRes.ok) throw new Error(`Zoya failed to sign: ${signRes.statusText}`);
    const signData = await signRes.json();
    console.log(`✅ Zoya signed! Current signatures count: ${signData.currentSignatures}, status: ${signData.status}`);

    // 12. Test PUT /api/petitions/:id/sign (Negative: cannot sign twice)
    console.log("\n🚫 Negative Test: Zoya tries to sign the same petition again...");
    const signAgainRes = await fetch(`${BACKEND_URL}/api/petitions/${pendingPetitionId}/sign`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${zoyaToken}` },
    });
    console.log(`Response Status: ${signAgainRes.status} (Expected: 400)`);
    if (signAgainRes.status !== 400) {
      throw new Error("Validation check failed: User allowed to sign the petition twice!");
    }
    console.log("✅ Validation check passed. Duplicate signing forbidden.");

    // 13. Test milestone reach: Hamza signs the class petition (milestone = 2)
    // Hamza is already the creator, but in this setup, does creator signature count? Yes, they can sign it.
    // Wait, let's see: class petition was created. Its signatures field has nobody yet or does it?
    // Let's check: in createPetition, signatures is not automatically populated with the creator.
    // So current signatures is 0. Let's have Zoya sign the class petition first, then Hamza.
    console.log("\n✍️ Zoya signs the class petition (1st signature)...");
    const signClassZoya = await fetch(`${BACKEND_URL}/api/petitions/${classPetitionId}/sign`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${zoyaToken}` },
    });
    if (!signClassZoya.ok) throw new Error(`Zoya failed to sign class petition: ${signClassZoya.statusText}`);
    
    console.log("✍️ Hamza signs the class petition (2nd signature, reaching milestone of 2)...");
    const signClassHamza = await fetch(`${BACKEND_URL}/api/petitions/${classPetitionId}/sign`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${hamzaToken}` },
    });
    if (!signClassHamza.ok) throw new Error(`Hamza failed to sign class petition: ${signClassHamza.statusText}`);
    const signClassHamzaData = await signClassHamza.json();
    console.log(`✅ Class Petition status after reaching milestone: ${signClassHamzaData.status} (Expected: Under Review)`);
    if (signClassHamzaData.status !== "Under Review") {
      throw new Error(`Milestone check failed: Petition status is ${signClassHamzaData.status}, expected: Under Review`);
    }
    console.log("✅ Milestone check passed! Status updated to Under Review.");

    // 14. Test AI Moderation / Flagging
    console.log("\n🤖 Testing AI Moderation (creating petition with flagged content)...");
    const flaggedRes = await fetch(`${BACKEND_URL}/api/petitions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hamzaToken}`,
      },
      body: JSON.stringify({
        title: "This class is a joke",
        description: "The teacher is a total bitch and stupid chutiya who doesn't know how to teach.",
        level: "Class",
      }),
    });
    
    console.log(`Response Status: ${flaggedRes.status} (Expected: 202)`);
    if (flaggedRes.status !== 202) {
      throw new Error(`AI Moderation failed: Flagged content not intercepted. Status: ${flaggedRes.status}`);
    }
    const flaggedData = await flaggedRes.json();
    console.log(`✅ AI Moderation intercepted flagged content:`, flaggedData);

    // Disconnect sockets
    hamzaSocket.disconnect();
    modSocket.disconnect();

    console.log("\n⭐️ ALL PETITION INTEGRATION TESTS PASSED SUCCESSFULLY! ⭐️");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error.message);
  }
}

runTest();
