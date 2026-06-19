import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../../utils/cloudinaryConfig.js'; 
import { 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getVendorQueue, 
  updateOrderStatus 
} from '../controller/vendorCanteenController.js';

const router = express.Router();

router.route('/menu')
  .post(protect, upload.single('image'), addMenuItem);

router.route('/menu/:itemId')
  .put(protect, upload.single('image'), updateMenuItem)
  .delete(protect, deleteMenuItem);

router.route('/orders')
  .get(protect, getVendorQueue);

router.route('/orders/:orderId/status')
  .put(protect, updateOrderStatus);

export default router;