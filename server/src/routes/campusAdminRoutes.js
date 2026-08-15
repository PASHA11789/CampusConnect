import express from 'express';
import { protect, authorizeCampusRoles } from '../middleware/authMiddleware.js';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllRestaurants,
  createRestaurantAdmin,
  deleteRestaurant,
  createUser,
  resetUserPassword,
  updateUser
} from '../controller/campusAdminController.js';

const router = express.Router();

router.use(protect);
router.use(authorizeCampusRoles('campus_admin'));

router.route('/users')
  .get(getAllUsers)
  .post(createUser);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.route('/users/:id/role')
  .put(updateUserRole);

router.route('/users/:id/reset-password')
  .put(resetUserPassword);

router.route('/restaurants')
  .get(getAllRestaurants)
  .post(createRestaurantAdmin);

router.route('/restaurants/:id')
  .delete(deleteRestaurant);

export default router;