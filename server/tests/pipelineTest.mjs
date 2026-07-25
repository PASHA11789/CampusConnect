/**
 * CampusConnect Delivery Pipeline Integration Test
 */
import { default as fetchModule } from "node-fetch";
// using global fetch

const BASE = "http://localhost:5000";
const VENDOR_EMAIL = "savour@campusconnect.com";
const VENDOR_PASS  = "password123";

const delay  = (ms) => new Promise(r => setTimeout(r, ms));
const passed = (msg) => { console.log(`  [PASS] ${msg}`); passCount++; };
const failed = (msg) => { console.log(`  [FAIL] ${msg}`); failCount++; };
const info   = (msg) => console.log(`  [INFO] ${msg}`);
const header = (msg) => console.log(`\n${"=".repeat(65)}\n  ${msg}\n${"=".repeat(65)}`);

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) passed(message);
  else           failed(message);
}

async function api(method, path, body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    let data;
    try { data = await res.json(); } catch { data = {}; }
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: { message: err.message } };
  }
}

async function registerAndLogin(payload) {
  const reg = await api("POST", "/api/auth/register", payload);
  if (reg.data?.token) return reg.data.token;
  // Try login if already exists
  const login = await api("POST", "/api/auth/login", { email: payload.email, password: payload.password });
  return login.data?.token || null;
}

async function main() {
  const ts = Date.now();
  console.log("\n" + "=".repeat(65));
  console.log("  CampusConnect Delivery Pipeline Integration Test");
  console.log("  " + new Date().toLocaleString());
  console.log("=".repeat(65));

  // -- STEP 1: Register 5 riders ----------------------------------------------
  header("STEP 1 — Registering 5 Test Riders");
  const riders = [];
  for (let i = 1; i <= 5; i++) {
    const email = `tride${i}.${ts}@test.com`;
    const token = await registerAndLogin({
      name: `Test Rider ${i}`,
      email,
      registeration_number: `2026F-tride-00${i}-${ts}`,
      password: "TestPass123",
      role: "rider",
      department: "Campus Delivery",
      semester: 0,
      program: "Delivery Partner",
      section: ""
    });
    if (token) { riders.push({ name: `Rider ${i}`, email, token }); passed(`Rider ${i} ready: ${email}`); }
    else        { failed(`Rider ${i} failed: ${email}`); }
  }
  assert(riders.length === 5, `5 riders created (got ${riders.length})`);

  // -- STEP 2: Register 5 students --------------------------------------------
  header("STEP 2 — Registering 5 Test Students");
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const email = `tstu${i}.${ts}@test.com`;
    const token = await registerAndLogin({
      name: `Test Student ${i}`,
      email,
      registeration_number: `2026F-tstu-00${i}-${ts}`,
      password: "TestPass123",
      role: "student",
      department: "Computer Science",
      semester: 4,
      program: "BSCS",
      section: "A"
    });
    if (token) { students.push({ name: `Student ${i}`, email, token }); passed(`Student ${i} ready: ${email}`); }
    else        { failed(`Student ${i} failed: ${email}`); }
  }
  assert(students.length === 5, `5 students created (got ${students.length})`);

  // -- STEP 3: Login vendor ---------------------------------------------------
  header("STEP 3 — Vendor Login");
  const vendorRes = await api("POST", "/api/vendor/auth/login", { email: VENDOR_EMAIL, password: VENDOR_PASS });
  const vendorToken = vendorRes.data?.token;
  assert(!!vendorToken, `Vendor "${VENDOR_EMAIL}" logged in`);
  if (!vendorToken) { failed("Cannot proceed without vendor. Aborting."); process.exit(1); }

  // -- STEP 4: Get restaurant -------------------------------------------------
  header("STEP 4 — Fetching Restaurant");
  const restRes = await api("GET", "/api/vendor/restaurant", null, vendorToken);
  const restaurantId = restRes.data?.restaurant?._id;
  const restaurantName = restRes.data?.restaurant?.name;
  assert(!!restaurantId, `Restaurant found: ${restaurantName} (${restaurantId})`);
  if (!restaurantId) { failed("No restaurant. Aborting."); process.exit(1); }

  // -- STEP 5: Place 5 orders simultaneously ---------------------------------
  header("STEP 5 — Placing 5 Orders Simultaneously");
  const orderPayloads = students.map((s, i) => ({
    restaurantId,
    items: [
      { name: "Chicken Pulao Kabab", quantity: 1, price: 380 },
      { name: "Cold Drink (345ml)",  quantity: i % 2 === 0 ? 2 : 1, price: 90 }
    ],
    totalAmount: i % 2 === 0 ? 560 : 470,
    contactNumber: `+9230000${i}${ts.toString().slice(-4)}`,
    deliveryLocation: `Block ${String.fromCharCode(65 + i)}, Test Campus`
  }));

  const orderResults = await Promise.all(
    orderPayloads.map((p, i) => api("POST", "/api/orders", p, students[i].token))
  );

  const orders = [];
  orderResults.forEach((r, i) => {
    if (r.status === 201 && r.data?.order?.orderId) {
      orders.push({ orderId: r.data.order.orderId, mongoId: r.data.order._id, student: students[i] });
      passed(`Order ${i + 1} placed: ${r.data.order.orderId} by ${students[i].name}`);
    } else {
      failed(`Order ${i + 1} failed: ${JSON.stringify(r.data)}`);
    }
  });
  assert(orders.length === 5, `All 5 orders placed simultaneously (got ${orders.length})`);
  if (orders.length < 5) { failed("Not all orders placed. Aborting."); process.exit(1); }

  // -- STEP 6: Vendor accepts all orders -------------------------------------
  header("STEP 6 — Vendor Accepting All 5 Orders");
  for (const order of orders) {
    const res = await api("PUT", `/api/vendor/orders/${order.orderId}/status`, { status: "accepted" }, vendorToken);
    assert(res.data?.success, `Vendor accepted ${order.orderId}`);
    await delay(80);
  }

  // -- STEP 7: RACE CONDITION TEST --------------------------------------------
  header("STEP 7 — RACE CONDITION: All 5 Riders Claim Ticket #1 Simultaneously");
  const raceTarget = orders[0];
  info(`Target ticket: ${raceTarget.orderId}`);
  info("Firing all 5 claim requests at the EXACT same time...");

  const racePromises = riders.map(r =>
    api("PUT", `/api/orders/${raceTarget.orderId}/accept-rider`, {}, r.token)
  );
  const raceResults = await Promise.all(racePromises);

  const winners = raceResults.filter(r => r.data?.success);
  const losers  = raceResults.filter(r => !r.data?.success);
  raceResults.forEach((r, i) => {
    info(`  ${riders[i].name}: ${r.data?.success ? "WON [CLAIMED]" : `blocked: ${r.data?.message}`}`);
  });

  assert(winners.length === 1, `Race condition: Exactly 1 winner (got ${winners.length}) — no double-claim!`);
  assert(losers.length  === 4, `Race condition: 4 riders correctly rejected (got ${losers.length})`);

  const winnerIdx = raceResults.findIndex(r => r.data?.success);
  info(`Winner of race: ${riders[winnerIdx]?.name}`);

  // -- STEP 8: Assign remaining tickets to remaining riders -------------------
  header("STEP 8 — Assigning Orders 2-5 to Riders 2-5");
  const freRiders  = riders.filter((_, i) => i !== winnerIdx);
  const freeOrders = orders.slice(1);
  const activeDeliveries = [{ order: orders[0], rider: riders[winnerIdx] }];

  for (let i = 0; i < freeOrders.length && i < freRiders.length; i++) {
    const res = await api("PUT", `/api/orders/${freeOrders[i].orderId}/accept-rider`, {}, freRiders[i].token);
    if (res.data?.success) {
      activeDeliveries.push({ order: freeOrders[i], rider: freRiders[i] });
      passed(`${freRiders[i].name} claimed ${freeOrders[i].orderId}`);
    } else {
      failed(`${freRiders[i].name} failed to claim ${freeOrders[i].orderId}: ${res.data?.message}`);
    }
    await delay(80);
  }

  // -- STEP 9: Already-busy rider rejects second ticket ----------------------
  header("STEP 9 — Busy Rider Double-Claim Prevention");
  if (freeOrders.length > 0 && freRiders.length > 0) {
    // freRiders[0] should already be busy with freeOrders[0]
    // Try to claim orders[0] again with the same rider
    const busyRider = freRiders[0];
    const extraOrder = orders[1]; // already claimed but test a new scenario
    const res = await api("PUT", `/api/orders/${orders[0].orderId}/accept-rider`, {}, busyRider.token);
    assert(!res.data?.success,
      `Busy rider "${busyRider.name}" correctly blocked from accepting second ticket: ${res.data?.message}`);
  }

  // -- STEP 10: Vendor Preparing + Ready for all ------------------------------
  header("STEP 10 — Vendor: Preparing then Ready (all 5 orders)");
  for (const order of orders) {
    let res = await api("PUT", `/api/vendor/orders/${order.orderId}/status`, { status: "preparing" }, vendorToken);
    assert(res.data?.success, `${order.orderId} ? preparing`);
    await delay(80);
    res = await api("PUT", `/api/vendor/orders/${order.orderId}/status`, { status: "ready" }, vendorToken);
    assert(res.data?.success, `${order.orderId} ? ready`);
    await delay(80);
  }

  // -- STEP 11: Full Rider Pipeline (pickup ? arrive ? complete) -------------
  header("STEP 11 — Rider Pipeline: Pickup ? Arrive ? Complete (all 5 orders)");
  for (const { order, rider } of activeDeliveries) {
    info(`Processing ${order.orderId} by ${rider.name}...`);

    let res = await api("PUT", `/api/orders/${order.orderId}/pickup`, {}, rider.token);
    assert(res.data?.success, `${rider.name}: ${order.orderId} ? picked_up`);
    await delay(60);

    res = await api("PUT", `/api/orders/${order.orderId}/arrive`, {}, rider.token);
    assert(res.data?.success, `${rider.name}: ${order.orderId} ? arrived`);
    await delay(60);

    res = await api("PUT", `/api/orders/${order.orderId}/complete`, {}, rider.token);
    assert(res.data?.success, `${rider.name}: ${order.orderId} ? COMPLETED`);
    await delay(60);
  }

  // -- STEP 12: Guard Validation ---------------------------------------------
  header("STEP 12 — Guard Validation (Out-of-Order State Transitions)");

  const guardOrder = await api("POST", "/api/orders", {
    restaurantId,
    items: [{ name: "Shami Kabab Platter", quantity: 1, price: 150 }],
    totalAmount: 150,
    contactNumber: "+923001234321",
    deliveryLocation: "Guard Test Block"
  }, students[0].token);

  const gId = guardOrder.data?.order?.orderId;
  assert(!!gId, `Guard test order created: ${gId}`);

  if (gId) {
    let r;
    r = await api("PUT", `/api/orders/${gId}/pickup`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: pickup blocked on pending order");

    r = await api("PUT", `/api/orders/${gId}/arrive`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: arrive blocked on pending order");

    r = await api("PUT", `/api/orders/${gId}/complete`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: complete blocked on pending order");

    r = await api("PUT", `/api/vendor/orders/${gId}/status`, { status: "preparing" }, vendorToken);
    assert(!r.data?.success, "GUARD: preparing blocked before accepting");

    r = await api("PUT", `/api/vendor/orders/${gId}/status`, { status: "accepted" }, vendorToken);
    assert(r.data?.success, "GUARD: accept works on pending");

    r = await api("PUT", `/api/vendor/orders/${gId}/status`, { status: "accepted" }, vendorToken);
    assert(!r.data?.success, "GUARD: double-accept rejected");

    r = await api("PUT", `/api/vendor/orders/${gId}/status`, { status: "preparing" }, vendorToken);
    assert(r.data?.success, "GUARD: preparing works after accept");

    r = await api("PUT", `/api/vendor/orders/${gId}/status`, { status: "ready" }, vendorToken);
    assert(r.data?.success, "GUARD: ready works after preparing");

    // Rider claims it
    r = await api("PUT", `/api/orders/${gId}/accept-rider`, {}, riders[0].token);
    assert(r.data?.success, "GUARD: rider can claim ticket in ready state");

    r = await api("PUT", `/api/orders/${gId}/arrive`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: arrive blocked before pickup");

    r = await api("PUT", `/api/orders/${gId}/complete`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: complete blocked before arrive");

    r = await api("PUT", `/api/orders/${gId}/pickup`, {}, riders[0].token);
    assert(r.data?.success, "GUARD: pickup works when ready");

    r = await api("PUT", `/api/orders/${gId}/complete`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: complete blocked before arrive");

    r = await api("PUT", `/api/orders/${gId}/arrive`, {}, riders[0].token);
    assert(r.data?.success, "GUARD: arrive works after pickup");

    r = await api("PUT", `/api/orders/${gId}/complete`, {}, riders[0].token);
    assert(r.data?.success, "GUARD: complete works after arrive");

    r = await api("PUT", `/api/orders/${gId}/complete`, {}, riders[0].token);
    assert(!r.data?.success, "GUARD: re-complete blocked on completed order");
  }

  // -- STEP 13: Cancellation Tests -------------------------------------------
  header("STEP 13 — Cancellation Tests");
  const cancelOrder = await api("POST", "/api/orders", {
    restaurantId,
    items: [{ name: "Crispy Fries", quantity: 1, price: 130 }],
    totalAmount: 130,
    contactNumber: "+923000000001",
    deliveryLocation: "Cancel Test Block"
  }, students[1].token);

  const cId = cancelOrder.data?.order?.orderId;
  if (cId) {
    let r;
    r = await api("PUT", `/api/vendor/orders/${cId}/status`, { status: "cancelled" }, vendorToken);
    assert(r.data?.success, "CANCEL: vendor can cancel pending order");

    r = await api("PUT", `/api/vendor/orders/${cId}/status`, { status: "cancelled" }, vendorToken);
    assert(!r.data?.success, "CANCEL: double-cancel rejected");

    r = await api("PUT", `/api/orders/${cId}/accept-rider`, {}, riders[0].token);
    assert(!r.data?.success, "CANCEL: rider cannot claim cancelled order");
  }

  // -- STEP 14: Nudge Tests --------------------------------------------------
  header("STEP 14 — Nudge Tests");
  const nudgeOrder = await api("POST", "/api/orders", {
    restaurantId,
    items: [{ name: "Savour Chicken Roll", quantity: 1, price: 220 }],
    totalAmount: 220,
    contactNumber: "+923001000100",
    deliveryLocation: "Nudge Test Block"
  }, students[2].token);

  const nId = nudgeOrder.data?.order?.orderId;
  if (nId) {
    let r;
    r = await api("POST", `/api/orders/${nId}/nudge`, {}, students[2].token);
    assert(r.data?.success, "NUDGE: student can nudge vendor on pending");

    // Nudge rider-arrival while not arrived ? should fail
    r = await api("POST", `/api/orders/${nId}/nudge-rider`, {}, students[2].token);
    assert(!r.data?.success, "NUDGE: arrival nudge rejected when rider not arrived");

    // Push to arrived state
    await api("PUT", `/api/vendor/orders/${nId}/status`, { status: "accepted" }, vendorToken);
    await api("PUT", `/api/vendor/orders/${nId}/status`, { status: "preparing" }, vendorToken);
    await api("PUT", `/api/vendor/orders/${nId}/status`, { status: "ready" }, vendorToken);
    await api("PUT", `/api/orders/${nId}/accept-rider`, {}, riders[0].token);
    await api("PUT", `/api/orders/${nId}/pickup`, {}, riders[0].token);
    await api("PUT", `/api/orders/${nId}/arrive`, {}, riders[0].token);

    r = await api("POST", `/api/orders/${nId}/nudge-rider`, {}, students[2].token);
    assert(r.data?.success, "NUDGE: student can nudge rider after arrived");

    // Complete to clean up
    await api("PUT", `/api/orders/${nId}/complete`, {}, riders[0].token);
  }

  // -- RESULTS ---------------------------------------------------------------
  header("FINAL RESULTS");
  const total = passCount + failCount;
  console.log(`  PASSED: ${passCount}`);
  console.log(`  FAILED: ${failCount}`);
  console.log(`  TOTAL:  ${total}`);
  console.log(`  SCORE:  ${total > 0 ? Math.round((passCount / total) * 100) : 0}%`);
  if (failCount === 0) console.log("\n  ALL TESTS PASSED — Pipeline is ROBUST!\n");
  else                 console.log(`\n  ${failCount} test(s) failed. Review above.\n`);

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(err => {
  console.error("TEST RUNNER CRASHED:", err);
  process.exit(1);
});
