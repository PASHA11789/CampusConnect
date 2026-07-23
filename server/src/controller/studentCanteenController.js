import Order from '../models/Order.js';
import Restaurant from '../models/Restaurants.js';

export const getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .select('name phone address coverImage deliveryRadiusKm');
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ message: "Failed to load restaurants", error: error.message });
  }
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select('menu name isActive');
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
    
    const availableMenu = restaurant.menu.filter(item => item.isAvailable);
    res.status(200).json({ success: true, restaurantName: restaurant.name, menu: availableMenu });
  } catch (error) {
    res.status(500).json({ message: "Failed to load menu", error: error.message });
  }
};

export { createOrder } from './orderController.js';

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .populate('restaurant', 'name phone coverImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching your orders", error: error.message });
  }
};