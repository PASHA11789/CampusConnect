import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { nudgeRateLimiter } from "../middleware/nudgeRateLimiter.js";
import {
  createOrder,
  dispatchOrder,
  acceptRiderTicket,
  arriveOrder,
  completeOrder,
  nudgeOrder,
  getMarketplaceTickets,
  getOrderById
} from "../controller/orderController.js";

const router = express.Router();

// Order creation & Marketplace browsing
router.route("/")
  .post(protect, createOrder);

router.route("/marketplace/tickets")
  .get(protect, getMarketplaceTickets);

router.route("/:id")
  .get(protect, getOrderById);

// Rider Marketplace & Socket Pipeline
router.route("/:id/dispatch")
  .put(protect, dispatchOrder);

router.route("/:id/accept-rider")
  .put(protect, acceptRiderTicket);

router.route("/:id/arrive")
  .put(protect, arriveOrder);

router.route("/:id/complete")
  .put(protect, completeOrder);

// Rate-limited Nudge feature (1 request per 3 minutes)
router.route("/:id/nudge")
  .post(protect, nudgeRateLimiter, nudgeOrder);

export default router;
