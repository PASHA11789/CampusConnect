import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { nudgeRateLimiter } from "../middleware/nudgeRateLimiter.js";
import {
  createOrder,
  acceptRiderTicket,
  pickupOrder,
  arriveOrder,
  completeOrder,
  nudgeOrder,
  nudgeRiderOnArrival,
  getMarketplaceTickets,
  getOrderById
} from "../controller/orderController.js";

const router = express.Router();

// Order creation
router.route("/").post(protect, createOrder);

// Marketplace — riders browse available tickets
router.route("/marketplace/tickets").get(protect, getMarketplaceTickets);

// Single order lookup
router.route("/:id").get(protect, getOrderById);

// ── Rider Pipeline ──────────────────────────────────────────────────────
// Stage 2 (from rider side): Rider claims a ticket
router.route("/:id/accept-rider").put(protect, acceptRiderTicket);

// Stage 5: Rider picks up food from restaurant
router.route("/:id/pickup").put(protect, pickupOrder);

// Stage 6: Rider marks arrived at delivery location
router.route("/:id/arrive").put(protect, arriveOrder);

// Stage 7: Rider marks order as fully delivered
router.route("/:id/complete").put(protect, completeOrder);

// ── Nudge Features ──────────────────────────────────────────────────────
// Student nudges vendor (rate-limited: 1 per 3 min)
router.route("/:id/nudge").post(protect, nudgeRateLimiter, nudgeOrder);

// Student nudges rider when rider has arrived (no rate limit — one-shot action)
router.route("/:id/nudge-rider").post(protect, nudgeRiderOnArrival);

export default router;

