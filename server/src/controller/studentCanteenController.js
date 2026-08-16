import Order from '../models/Order.js';
import Restaurant from '../models/Restaurants.js';

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";

export const getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({})
      .select('name phone address coverImage deliveryRadiusKm isActive owner')
      .populate('owner', 'avatar name')
      .lean();
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ message: "Failed to load restaurants", error: safeError(error) });
  }
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .select('menu name isActive')
      .lean();
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    res.status(200).json({ success: true, restaurantName: restaurant.name, menu: restaurant.menu || [] });
  } catch (error) {
    res.status(500).json({ message: "Failed to load menu", error: safeError(error) });
  }
};

export { createOrder } from './orderController.js';

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('restaurant', 'name phone coverImage')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching your orders", error: safeError(error) });
  }
};