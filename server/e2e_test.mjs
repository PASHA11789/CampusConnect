import { fork, execSync } from "child_process";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Resolve paths
const serverDir = path.resolve(".");
dotenv.config();

// Import models
import User from "./src/models/User.js";
import Vendor from "./src/models/Vendor.js";
import Restaurant from "./src/models/Restaurants.js";
import Report from "./src/models/Report.js";

async function runTests() {
  console.log("🚀 Starting End-to-End Test Suite...");

  // 1. Seed the Database
  console.log("🧹 Seeding database...");
  try {
    execSync("node seeder.js", { cwd: serverDir, stdio: "inherit" });
    console.log("✅ Database seeded successfully.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }

  // Connect Mongoose for DB assertions
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🔌 Connected to database for E2E assertions.");

  // 2. Start the server
  console.log("⚡ Starting server process...");
  const serverProcess = fork("server.js", [], { cwd: serverDir, stdio: "inherit", env: process.env });

  serverProcess.on("exit", (code, signal) => {
    console.log(`❗ Server process exited with code ${code} and signal ${signal}`);
  });

  // Wait for server to boot
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("🌐 Server is up. Executing requests...");

  const baseUrl = "http://127.0.0.1:5000/api";
  let adminToken = "";
  let studentAToken = "";
  let studentBToken = "";
  let studentAId = "";
  let studentBId = "";
  let createdStudentId = "";
  let createdAlumniId = "";
  let provisionedRestaurantId = "";
  let provisionedVendorId = "";

  try {
    // ----------------------------------------------------
    // AUTHENTICATION PREPARATION
    // ----------------------------------------------------
    console.log("\n🔑 Authenticating users...");
    
    // Login Admin
    let res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@campusconnect.com", password: "password123" })
    });
    let data = await res.json();
    if (res.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(data)}`);
    adminToken = data.token;
    console.log("✅ Admin logged in.");

    // Login Student A (Hamza Malik)
    res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "hamza@student.com", password: "password123" })
    });
    data = await res.json();
    if (res.status !== 200) throw new Error(`Student A login failed: ${JSON.stringify(data)}`);
    studentAToken = data.token;
    studentAId = data._id;
    console.log("✅ Student A logged in.");

    // Login Student B (Zoya Sheikh)
    res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "zoya@student.com", password: "password123" })
    });
    data = await res.json();
    if (res.status !== 200) throw new Error(`Student B login failed: ${JSON.stringify(data)}`);
    studentBToken = data.token;
    studentBId = data._id;
    console.log("✅ Student B logged in.");

    // ----------------------------------------------------
    // PHASE 1: Campus Admin Operations (User & Role Management)
    // ----------------------------------------------------
    console.log("\n🔹 Phase 1: Campus Admin Operations");

    // 1. Create Student
    res = await fetch(`${baseUrl}/campus-admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "E2E Student",
        email: "e2e_student@campusconnect.com",
        password: "studentpassword123",
        role: "student",
        registrationNumber: "2026F-e2estudent-001"
      })
    });
    data = await res.json();
    console.log("Create Student Status:", res.status, data);
    if (res.status !== 201) throw new Error("Phase 1: Create Student failed.");
    createdStudentId = data.userId;
    console.log("✅ Student created (201).");

    // 2. Create Alumni (verify MongoDB schema accepts role)
    res = await fetch(`${baseUrl}/campus-admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: "E2E Alumni",
        email: "e2e_alumni@campusconnect.com",
        password: "alumnipassword123",
        role: "alumni",
        registrationNumber: "2020F-e2ealumni-002"
      })
    });
    data = await res.json();
    console.log("Create Alumni Status:", res.status, data);
    if (res.status !== 201) throw new Error("Phase 1: Create Alumni failed.");
    createdAlumniId = data.userId;
    
    // Verify in DB
    const dbAlumni = await User.findById(createdAlumniId);
    if (!dbAlumni || dbAlumni.role !== "alumni") throw new Error("Phase 1: Alumni role validation failed in database.");
    console.log("✅ Alumni created with correct role (201, DB verified).");

    // 3. Promote Role to student_mod
    res = await fetch(`${baseUrl}/campus-admin/users/${createdStudentId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ role: "student_mod" })
    });
    data = await res.json();
    console.log("Promote Role Status:", res.status, data);
    if (res.status !== 200) throw new Error("Phase 1: Promote role failed.");
    
    // Verify in DB
    const dbStudent = await User.findById(createdStudentId);
    if (!dbStudent || dbStudent.role !== "student_mod") throw new Error("Phase 1: Role update not reflected in database.");
    console.log("✅ Student promoted to student_mod (200, DB verified).");

    // 4. Secure Password Reset
    // Test A (Failure): Wrong adminPassword
    res = await fetch(`${baseUrl}/campus-admin/users/${createdStudentId}/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        adminPassword: "wrongpassword",
        newStudentPassword: "newpassword123"
      })
    });
    console.log("Password Reset Test A Status:", res.status);
    if (res.status !== 401) throw new Error("Phase 1: Test A expected 401 Unauthorized but got " + res.status);
    console.log("✅ Test A passed: Wrong admin password correctly unauthorized (401).");

    // Test B (Success): Correct adminPassword
    res = await fetch(`${baseUrl}/campus-admin/users/${createdStudentId}/reset-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        adminPassword: "password123",
        newStudentPassword: "newpassword123"
      })
    });
    console.log("Password Reset Test B Status:", res.status);
    if (res.status !== 200) throw new Error("Phase 1: Test B expected 200 Success but got " + res.status);

    // Verify authentication with new password
    res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "e2e_student@campusconnect.com", password: "newpassword123" })
    });
    if (res.status !== 200) throw new Error("Phase 1: Student cannot login with the reset password.");
    console.log("✅ Test B passed: Password reset success and verified via login (200).");

    // 5. Delete User
    res = await fetch(`${baseUrl}/campus-admin/users/${createdStudentId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Delete User Status:", res.status);
    if (res.status !== 200) throw new Error("Phase 1: User deletion failed.");
    
    // Verify deleted in DB
    const deletedUser = await User.findById(createdStudentId);
    if (deletedUser) throw new Error("Phase 1: User still exists in DB after deletion.");
    console.log("✅ User successfully deleted and verified removed from DB (200).");


    // ----------------------------------------------------
    // PHASE 2: Campus Admin Operations (Restaurant Provisioning)
    // ----------------------------------------------------
    console.log("\n🔹 Phase 2: Restaurant & Vendor Provisioning");

    // 1. Provision Restaurant & Vendor
    res = await fetch(`${baseUrl}/campus-admin/restaurants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        restaurantName: "E2E Burger Junction",
        phone: "03217654321",
        registeration_number: "VND-E2E-BURGER",
        password: "vendorpassword123",
        address: "Block D Lounge",
        deliveryRadiusKm: 6
      })
    });
    data = await res.json();
    console.log("Provision Restaurant Status:", res.status, data);
    if (res.status !== 201) throw new Error("Phase 2: Provisioning failed.");
    provisionedRestaurantId = data.restaurantId;

    // Database Assertion: Verify Vendor and Restaurant documents
    const dbRestaurant = await Restaurant.findById(provisionedRestaurantId);
    if (!dbRestaurant) throw new Error("Phase 2: Restaurant document not found in database.");
    
    provisionedVendorId = dbRestaurant.owner;
    const dbVendor = await Vendor.findById(provisionedVendorId);
    if (!dbVendor) throw new Error("Phase 2: Associated Vendor document not found in database.");
    
    if (dbVendor.registeration_number !== "VND-E2E-BURGER") throw new Error("Phase 2: Vendor registration mismatch.");
    console.log("✅ Restaurant and Vendor successfully provisioned (201, DB verified).");

    // 2. Delete Restaurant (Cascade Deletion)
    res = await fetch(`${baseUrl}/campus-admin/restaurants/${provisionedRestaurantId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    console.log("Delete Restaurant Status:", res.status);
    if (res.status !== 200) throw new Error("Phase 2: Deletion failed.");

    // Database Assertion: Verify both Restaurant and Vendor are permanently deleted
    const deletedRestaurant = await Restaurant.findById(provisionedRestaurantId);
    if (deletedRestaurant) throw new Error("Phase 2: Restaurant document still exists.");
    
    const deletedVendor = await Vendor.findById(provisionedVendorId);
    if (deletedVendor) throw new Error("Phase 2: Isolated Vendor account was not cascade-deleted.");
    console.log("✅ Restaurant and Vendor permanently cascade-deleted (200, DB verified).");


    // ----------------------------------------------------
    // PHASE 3: Student Profile & Privacy Logic
    // ----------------------------------------------------
    console.log("\n🔹 Phase 3: Student Profile & Privacy Logic");

    // 1. Cloudinary Upload
    const mockPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );
    const boundary = "----WebKitFormBoundaryE2ETest";
    const bodyParts = [
      `--${boundary}\r\nContent-Disposition: form-data; name="avatar"; filename="mock.png"\r\nContent-Type: image/png\r\n\r\n`,
      mockPngBuffer,
      `\r\n--${boundary}--\r\n`
    ];
    
    // Concatenate standard buffer parts
    const multipartBody = Buffer.concat([
      Buffer.from(bodyParts[0]),
      bodyParts[1],
      Buffer.from(bodyParts[2])
    ]);

    res = await fetch(`${baseUrl}/users/upload-avatar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${studentAToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    });
    data = await res.json();
    console.log("Avatar Upload Status:", res.status, data);
    if (res.status !== 200 || !data.imageUrl) throw new Error("Phase 3: Avatar upload failed.");
    const uploadedImageUrl = data.imageUrl;
    console.log("✅ Avatar uploaded to Cloudinary successfully:", uploadedImageUrl);

    // 2. Update Profile & Toggle Privacy (Hide Name)
    res = await fetch(`${baseUrl}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentAToken}`
      },
      body: JSON.stringify({
        name: "Hamza Masked Name",
        isNameHidden: true,
        avatar: uploadedImageUrl
      })
    });
    data = await res.json();
    console.log("Update Profile (Hide Name) Status:", res.status, data);
    if (res.status !== 200) throw new Error("Phase 3: Profile update failed.");
    console.log("✅ Profile name updated and set to hidden.");

    // 3. Public Profile Masking (Critical Test)
    // Fetch profile as Student B (Zoya)
    res = await fetch(`${baseUrl}/users/${studentAId}/public`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentBToken}` }
    });
    data = await res.json();
    console.log("Get Public Profile (Hidden) Status:", res.status, data);
    if (res.status !== 200) throw new Error("Phase 3: Public profile fetch failed.");
    
    // Assert: Name is hidden, must return "Student [registrationNumber]"
    const expectedMaskedName = `Student 2024F-mulbscs-055`;
    if (data.profile.displayName !== expectedMaskedName) {
      throw new Error(`Phase 3 Assertion failed: Expected display name to be "${expectedMaskedName}" but got "${data.profile.displayName}"`);
    }
    console.log("✅ Critical Assertion Passed: Real name masked, returned registration identifier.");

    // 4. Toggle privacy: isNameHidden = false
    res = await fetch(`${baseUrl}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentAToken}`
      },
      body: JSON.stringify({ isNameHidden: false })
    });
    console.log("Toggle Privacy (Show Name) Status:", res.status);
    if (res.status !== 200) throw new Error("Phase 3: Toggle privacy to false failed.");

    // Fetch again as Student B
    res = await fetch(`${baseUrl}/users/${studentAId}/public`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${studentBToken}` }
    });
    data = await res.json();
    console.log("Get Public Profile (Visible) Status:", res.status, data);
    if (res.status !== 200) throw new Error("Phase 3: Public profile fetch failed after toggle.");
    
    if (data.profile.displayName !== "Hamza Masked Name") {
      throw new Error(`Phase 3 Assertion failed: Expected real name "Hamza Masked Name" but got "${data.profile.displayName}"`);
    }
    console.log("✅ Real name now correctly visible in public profile.");


    // ----------------------------------------------------
    // PHASE 4: Community Reporting System
    // ----------------------------------------------------
    console.log("\n🔹 Phase 4: Community Reporting System");

    // 1. Self-Report Block
    res = await fetch(`${baseUrl}/users/${studentAId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentAToken}`
      },
      body: JSON.stringify({
        reason: "Self Report Fail Test",
        details: "Should block student reporting themselves"
      })
    });
    data = await res.json();
    console.log("Self Report Status:", res.status, data);
    if (res.status !== 400 || data.message !== "Cannot report your own profile") {
      throw new Error(`Phase 4: Self-report check failed. Expected 400 with message "Cannot report your own profile" but got ${res.status} and ${JSON.stringify(data)}`);
    }
    console.log("✅ Self-report correctly blocked with bad request (400).");

    // 2. Submit Valid Report (A reports B)
    res = await fetch(`${baseUrl}/users/${studentBId}/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentAToken}`
      },
      body: JSON.stringify({
        reason: "Obscene Avatar",
        details: "This profile has offensive artwork."
      })
    });
    data = await res.json();
    console.log("Submit Report Status:", res.status, data);
    if (res.status !== 201) throw new Error("Phase 4: Submitting report failed.");
    const reportId = data.reportId;

    // Database Assertion: Verify Report collection document
    const dbReport = await Report.findById(reportId);
    if (!dbReport) throw new Error("Phase 4: Report document not found in database.");
    if (dbReport.reportedBy.toString() !== studentAId.toString()) throw new Error("Phase 4: reportedBy ID mismatch.");
    if (dbReport.targetUser.toString() !== studentBId.toString()) throw new Error("Phase 4: targetUser ID mismatch.");
    if (dbReport.type !== "Profile_Violation") throw new Error("Phase 4: Report type mismatch.");
    if (dbReport.status !== "Pending") throw new Error("Phase 4: Report status mismatch.");
    console.log("✅ Valid report submitted and confirmed in database (201, DB verified).");

    console.log("\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULY WITH ZERO ERRORS!");

  } catch (error) {
    console.error("\n❌ E2E Verification failed with error:", error.message);
    console.error(error);
    process.exitCode = 1;
  } finally {
    console.log("\n🧹 Cleaning up test process...🔌 Disconnecting Mongoose...");
    await mongoose.disconnect();
    serverProcess.kill();
    console.log("🛑 Server process terminated. E2E run complete.");
  }
}

runTests();
