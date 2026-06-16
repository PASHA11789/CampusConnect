import dotenv from "dotenv";
dotenv.config();

const API_URL = "http://localhost:5000/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("🚀 Starting Lost & Found Moderation Integration Tests (using native fetch)...");
  let adminToken = "";
  let studentToken = "";
  let flaggedItemId = "";
  let secondFlaggedItemId = "";

  try {
    // 1. Authenticate Student
    console.log("\n🔑 Authenticating student (hamza@student.com)...");
    const studentLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "hamza@student.com",
        password: "password123",
      }),
    });
    if (!studentLoginRes.ok) {
      throw new Error(`Failed to log in student: ${studentLoginRes.statusText}`);
    }
    const studentLoginData = await studentLoginRes.json();
    studentToken = studentLoginData.token;
    console.log("✅ Student authenticated successfully.");

    // 2. Authenticate Admin
    console.log("\n🔑 Authenticating admin (admin@campusconnect.com)...");
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@campusconnect.com",
        password: "password123",
      }),
    });
    if (!adminLoginRes.ok) {
      throw new Error(`Failed to log in admin: ${adminLoginRes.statusText}`);
    }
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.token;
    console.log("✅ Admin authenticated successfully.");

    // 3. Report a normal (non-flagged) Lost & Found item
    console.log("\n📦 Reporting a clean Lost & Found item...");
    const cleanItemRes = await fetch(`${API_URL}/lost-found`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        type: "LOST",
        itemName: "Blue Wallet",
        description: "Lost a blue leather wallet near the library courtyard.",
        location: "Library Courtyard",
      }),
    });
    if (!cleanItemRes.ok) {
      throw new Error(`Failed to report clean item: ${cleanItemRes.statusText}`);
    }
    const cleanItemData = await cleanItemRes.json();
    console.log(`✅ Clean item reported. Status: ${cleanItemRes.status}. Item ID: ${cleanItemData.item?._id}`);

    // 4. Report a flagged Lost & Found item (using local regex trigger 'chutiya')
    console.log("\n🛡️ Reporting a flagged Lost & Found item...");
    const flaggedItemRes = await fetch(`${API_URL}/lost-found`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        type: "LOST",
        itemName: "Math Textbook",
        description: "Some chutiya stole my book from class room B.",
        location: "Classroom B",
      }),
    });
    if (flaggedItemRes.status !== 202) {
      throw new Error(`Expected status 202 for under-review item, got: ${flaggedItemRes.status}`);
    }
    const flaggedItemData = await flaggedItemRes.json();
    console.log(`✅ Flagged item submitted. Status: ${flaggedItemRes.status}. Under Review: ${flaggedItemData.underReview}`);

    // 5. Fetch Moderation Queue as Admin and check for flagged item and password leakage
    console.log("\n🛡️ Fetching moderation queue as Admin...");
    const modQueueRes = await fetch(`${API_URL}/moderation/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!modQueueRes.ok) {
      throw new Error(`Failed to get moderation queue: ${modQueueRes.statusText}`);
    }
    const modQueueData = await modQueueRes.json();
    console.log("✅ Queue loaded. Status:", modQueueRes.status);
    console.log(`Counts: Forums=${modQueueData.counts?.forums}, Petitions=${modQueueData.counts?.petitions}, LostFound=${modQueueData.counts?.lostFound}`);

    const queueItems = modQueueData.queue?.lostFound || [];
    const targetItem = queueItems.find((item) => item.itemName === "Math Textbook");
    if (!targetItem) {
      throw new Error("❌ Flagged Lost & Found item was not found in the moderation queue!");
    }
    console.log(`✅ Found flagged item in queue. Item ID: ${targetItem._id}`);
    flaggedItemId = targetItem._id;

    // Verify reporter details and check for password leak
    console.log("🔍 Checking for reporter password leak in queue...");
    if (targetItem.reporter) {
      console.log(`Reporter info: Name=${targetItem.reporter.name}, RegNum=${targetItem.reporter.registeration_number}`);
      if (targetItem.reporter.password) {
        throw new Error("❌ CRITICAL BUG: Reporter password hash is leaked in the moderation queue!");
      }
      console.log("✅ Verified: No password hash leaked in moderation queue.");
    } else {
      throw new Error("❌ Reporter not populated in moderation queue item!");
    }

    // 6. Test Invalid Action on moderateItem (should return 400 instead of hanging)
    console.log("\n⏳ Testing moderation action validation (invalid action)...");
    const invalidActionRes = await fetch(
      `${API_URL}/moderation/lostfound/${flaggedItemId}/moderate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: "Maybe" }),
      }
    );
    if (invalidActionRes.status === 400) {
      const invalidActionData = await invalidActionRes.json();
      console.log(`✅ Success: Server correctly rejected invalid action with status 400. Message: ${invalidActionData.message}`);
    } else {
      throw new Error(`❌ Expected status 400 for invalid action, got: ${invalidActionRes.status}`);
    }

    // 7. Approve the Flagged Item as Admin
    console.log("\n✅ Approving flagged item...");
    const approveRes = await fetch(
      `${API_URL}/moderation/lostfound/${flaggedItemId}/moderate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: "Approve" }),
      }
    );
    if (!approveRes.ok) {
      throw new Error(`Failed to approve item: ${approveRes.statusText}`);
    }
    const approveData = await approveRes.json();
    console.log(`✅ Item approved. Status: ${approveRes.status}, Message: ${approveData.message}`);

    // Verify it is no longer in moderation queue
    const queueAfterApproveRes = await fetch(`${API_URL}/moderation/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueAfterApproveData = await queueAfterApproveRes.json();
    const itemInQueue = (queueAfterApproveData.queue?.lostFound || []).some((item) => item._id === flaggedItemId);
    if (itemInQueue) {
      throw new Error("❌ Item is still in moderation queue after approval!");
    }
    console.log("✅ Verified: Item removed from moderation queue.");

    // 8. Create a second flagged item to reject and delete
    console.log("\n🛡️ Reporting a second flagged Lost & Found item...");
    const secondFlaggedItemRes = await fetch(`${API_URL}/lost-found`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        type: "LOST",
        itemName: "Science Lab Coat",
        description: "Lost my lab coat containing sexii stickers.",
        location: "Chemistry Lab",
      }),
    });
    if (secondFlaggedItemRes.status !== 202) {
      throw new Error(`Expected status 202 for under-review item, got: ${secondFlaggedItemRes.status}`);
    }
    console.log(`✅ Second flagged item submitted. Status: ${secondFlaggedItemRes.status}`);

    const queueBeforeRejectRes = await fetch(`${API_URL}/moderation/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueBeforeRejectData = await queueBeforeRejectRes.json();
    const secondTargetItem = (queueBeforeRejectData.queue?.lostFound || []).find((item) => item.itemName === "Science Lab Coat");
    if (!secondTargetItem) {
      throw new Error("❌ Second flagged Lost & Found item was not found in the moderation queue!");
    }
    secondFlaggedItemId = secondTargetItem._id;

    // 9. Reject the Flagged Item as Admin
    console.log("\n❌ Rejecting and deleting second flagged item...");
    const rejectRes = await fetch(
      `${API_URL}/moderation/lostfound/${secondFlaggedItemId}/moderate`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ action: "Reject" }),
      }
    );
    if (!rejectRes.ok) {
      throw new Error(`Failed to reject item: ${rejectRes.statusText}`);
    }
    const rejectData = await rejectRes.json();
    console.log(`✅ Item rejected. Status: ${rejectRes.status}, Message: ${rejectData.message}`);

    // Verify it is no longer in moderation queue and is deleted
    const queueAfterRejectRes = await fetch(`${API_URL}/moderation/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueAfterRejectData = await queueAfterRejectRes.json();
    const secondItemInQueue = (queueAfterRejectData.queue?.lostFound || []).some((item) => item._id === secondFlaggedItemId);
    if (secondItemInQueue) {
      throw new Error("❌ Second item is still in moderation queue after rejection!");
    }
    console.log("✅ Verified: Rejected item removed from moderation queue and permanently deleted.");

    console.log("\n🎉 All integration tests passed successfully! 🎉");
  } catch (error) {
    console.error("\n❌ Test Suite Failed:", error.message);
    process.exit(1);
  }
}

runTests();
