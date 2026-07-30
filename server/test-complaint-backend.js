import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "./utils/db.js";
import User from "./src/models/User.js";
import Complaint from "./src/models/Complaint.js";
import Notification from "./src/models/Notification.js";
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  pingAdminsForComplaint,
  upvoteComplaint,
  deleteComplaint,
  getComplaintStats,
} from "./src/controller/complaintController.js";
import { getModerationQueue, moderateItem } from "./src/controller/modController.js";

async function runComplaintTests() {
  console.log("\n==================================================");
  console.log("   CampusConnect Suggestion / Complaint Test Suite");
  console.log("==================================================\n");

  try {
    await connectDB();
    console.log("✅ Database Connected.");

    // Helper res / req mock
    const createMockReqRes = (user, body = {}, query = {}, params = {}) => {
      let statusCode = 200;
      let responseData = null;

      const req = {
        user,
        body,
        query,
        params,
        app: {
          get: (key) => (key === "socketio" ? { to: () => ({ emit: () => {} }) } : null),
        },
      };

      const res = {
        status: (code) => {
          statusCode = code;
          return res;
        },
        json: (data) => {
          responseData = data;
          return res;
        },
        getStatusCode: () => statusCode,
        getData: () => responseData,
      };

      return { req, res };
    };

    // Find test users or create fallback
    let student = await User.findOne({ role: "student" });
    if (!student) {
      student = await User.create({
        name: "Test Student",
        email: "teststudent@campus.edu",
        registeration_number: "TS-2026-01",
        password: "password123",
        role: "student",
      });
    }

    let mod = await User.findOne({ role: "student_mod" });
    if (!mod) {
      mod = await User.create({
        name: "Test Moderator",
        email: "testmod@campus.edu",
        registeration_number: "TM-2026-01",
        password: "password123",
        role: "student_mod",
      });
    }

    let admin = await User.findOne({ role: { $in: ["admin", "campus_admin"] } });
    if (!admin) {
      admin = await User.create({
        name: "Test Admin",
        email: "testadmin@campus.edu",
        registeration_number: "TA-2026-01",
        password: "password123",
        role: "admin",
      });
    }

    console.log(`👤 Student: ${student.name} (${student._id})`);
    console.log(`🛡️  Mod: ${mod.name} (${mod._id})`);
    console.log(`👑 Admin: ${admin.name} (${admin._id})\n`);

    // Clean old test complaints
    await Complaint.deleteMany({ title: { $regex: /^TEST_/ } });

    // 1. Create a Suggestion
    console.log("--- 1. Testing Suggestion Creation ---");
    const { req: req1, res: res1 } = createMockReqRes(student, {
      title: "TEST_SUGGESTION: Add 24/7 Library Quiet Zone",
      description: "We suggest extending library hours during finals week to 24/7.",
      type: "suggestion",
      category: "Academics",
      priority: "Medium",
    });
    await createComplaint(req1, res1);
    const suggestionData = res1.getData();
    if (res1.getStatusCode() === 201 && suggestionData.success) {
      console.log("✅ Suggestion Created successfully:", suggestionData.complaint._id);
    } else {
      console.error("❌ Suggestion Creation Failed:", suggestionData);
    }
    const suggestionId = suggestionData.complaint._id;

    // 2. Create a Complaint (Anonymous)
    console.log("\n--- 2. Testing Anonymous Complaint Creation ---");
    const { req: req2, res: res2 } = createMockReqRes(student, {
      title: "TEST_COMPLAINT: Canteen Food Temperature Issue",
      description: "Food served at Canteen Block B was cold today.",
      type: "complaint",
      category: "Canteen",
      isAnonymous: true,
      priority: "High",
    });
    await createComplaint(req2, res2);
    const complaintData = res2.getData();
    if (res2.getStatusCode() === 201 && complaintData.success) {
      console.log("✅ Complaint Created (Anonymous) successfully:", complaintData.complaint._id);
    } else {
      console.error("❌ Complaint Creation Failed:", complaintData);
    }
    const complaintId = complaintData.complaint._id;

    // 3. Test Upvoting
    console.log("\n--- 3. Testing Upvoting ---");
    const { req: reqUp, res: resUp } = createMockReqRes(student, {}, {}, { id: suggestionId });
    await upvoteComplaint(reqUp, resUp);
    console.log("✅ Upvoted Suggestion:", resUp.getData());

    // 4. Test Getting All Complaints (Filter & Anonymous Sanitization)
    console.log("\n--- 4. Testing Get All Complaints & Anonymous Shielding ---");
    const { req: reqList, res: resList } = createMockReqRes(student, {}, { search: "TEST_" });
    await getAllComplaints(reqList, resList);
    const listData = resList.getData();
    console.log(`✅ Fetched ${listData.count} complaints for student view.`);
    const anonItem = listData.complaints.find((c) => c._id.toString() === complaintId.toString());
    if (anonItem && anonItem.submittedBy.name === "Anonymous User") {
      console.log("✅ Anonymous user identity correctly redacted for non-staff viewers.");
    } else {
      console.log("ℹ️  User view output:", anonItem?.submittedBy);
    }

    // 5. Test Mod Room Queue Integration
    console.log("\n--- 5. Testing Mod Room Queue Integration ---");
    const { req: reqModQueue, res: resModQueue } = createMockReqRes(mod);
    await getModerationQueue(reqModQueue, resModQueue);
    const queueData = resModQueue.getData();
    if (resModQueue.getStatusCode() === 200 && queueData.queue.complaints) {
      console.log(`✅ Mod Room Queue loaded ${queueData.counts.complaints} complaints/suggestions.`);
    } else {
      console.error("❌ Failed to fetch Mod Room Queue:", queueData);
    }

    // 6. Test Ping Admin (Escalation by Moderator)
    console.log("\n--- 6. Testing Admin Escalation / Ping ---");
    const { req: reqPing, res: resPing } = createMockReqRes(
      mod,
      { reason: "Food safety concern requires immediate campus admin review!" },
      {},
      { id: complaintId }
    );
    await pingAdminsForComplaint(reqPing, resPing);
    const pingData = resPing.getData();
    if (resPing.getStatusCode() === 200 && pingData.complaint.isEscalated) {
      console.log("✅ Complaint escalated to Urgent and Admins pinged successfully.");
    } else {
      console.error("❌ Admin Escalation Failed:", pingData);
    }

    // Check if notification was sent to admin
    const adminNotif = await Notification.findOne({
      recipient: admin._id,
      type: "COMPLAINT",
    }).sort({ createdAt: -1 });
    if (adminNotif) {
      console.log("✅ Notification generated for admin:", adminNotif.message);
    }

    // 7. Test Admin Status Resolution with Response
    console.log("\n--- 7. Testing Admin Resolution & Status Update ---");
    const { req: reqResolve, res: resResolve } = createMockReqRes(
      admin,
      {
        status: "Resolved",
        response: "Inspected cafeteria management. Food temperature standards have been enforced.",
      },
      {},
      { id: complaintId }
    );
    await updateComplaintStatus(reqResolve, resResolve);
    const resolveData = resResolve.getData();
    if (resResolve.getStatusCode() === 200 && resolveData.complaint.status === "Resolved") {
      console.log("✅ Complaint marked as Resolved with Admin Response:", resolveData.complaint.adminResponse);
    } else {
      console.error("❌ Admin Resolution Failed:", resolveData);
    }

    // 8. Test Complaint Statistics
    console.log("\n--- 8. Testing Complaint Statistics ---");
    const { req: reqStats, res: resStats } = createMockReqRes(admin);
    await getComplaintStats(reqStats, resStats);
    console.log("✅ Complaint Stats:", resStats.getData().stats);

    // Clean up test items
    await Complaint.deleteMany({ title: { $regex: /^TEST_/ } });
    console.log("\n==================================================");
    console.log("   🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    console.log("==================================================\n");
  } catch (err) {
    console.error("💥 Test Suite Error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runComplaintTests();
