import express from 'express';
import { protectVendor } from '../middleware/authMiddleware.js';
import upload from '../../utils/cloudinaryConfig.js'; 
import { 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getVendorQueue, 
  updateOrderStatus,
  getVendorRestaurant,
  toggleRestaurantStatus
} from '../controller/vendorCanteenController.js';

const router = express.Router();

router.route('/restaurant')
  .get(protectVendor, getVendorRestaurant);

router.route('/restaurant/status')
  .put(protectVendor, toggleRestaurantStatus);

router.route('/menu')
  .post(protectVendor, upload.single('image'), addMenuItem);

router.route('/menu/:itemId')
  .put(protectVendor, upload.single('image'), updateMenuItem)
  .delete(protectVendor, deleteMenuItem);

router.route('/orders')
  .get(protectVendor, getVendorQueue);

router.route('/orders/:orderId/status')
  .put(protectVendor, updateOrderStatus);

export default router;