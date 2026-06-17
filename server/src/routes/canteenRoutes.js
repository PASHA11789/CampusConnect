import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getActiveRestaurants, 
  getRestaurantMenu, 
  createOrder, 
  getMyOrders 
} from '../controller/studentCanteenController.js';

const router = express.Router();

router.route('/restaurants')
  .get(protect, getActiveRestaurants);

router.route('/restaurants/:id/menu')
  .get(protect, getRestaurantMenu);

router.route('/orders')
  .post(protect, createOrder);

router.route('/orders/my-orders')
  .get(protect, getMyOrders);

export default router;