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
  updateVendorRestaurant,
  toggleRestaurantStatus,
  getVendorRiders,
  createVendorRider,
  updateVendorRider,
  deleteVendorRider
} from '../controller/vendorCanteenController.js';

const router = express.Router();

router.route('/restaurant')
  .get(protectVendor, getVendorRestaurant)
  .put(protectVendor, updateVendorRestaurant);

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

router.route('/riders')
  .get(protectVendor, getVendorRiders)
  .post(protectVendor, createVendorRider);

router.route('/riders/:riderId')
  .put(protectVendor, updateVendorRider)
  .delete(protectVendor, deleteVendorRider);

export default router;