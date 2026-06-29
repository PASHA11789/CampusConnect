import User from "../models/User.js"
import Restaurant from "../models/Restaurants.js"
import Vendor from '../models/Vendor.js'
import bcrypt from "bcryptjs"

export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find({ role: { $in: ["student", "student_mod"] } })
      .select('-password')
      .sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {

    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
}

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body

    if (!['student', 'student_mod', 'alumni', 'admin', 'campus_admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." })
    }
    const user = await User.findByIdAndUpdate(req.params.id,

      { role },
      { new: true, runValidators: true }
    ).select("-password")
    if (!user) return res.status(404).json({ message: "User not Found" })
    res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) { res.status(500).json({ message: "Error updating user role", error: error.message }); }
}


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, message: "User permanently deleted." })
  } catch (error) { res.status(500).json({ message: "Error deleting user", error: error.message }); }
}


export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .populate('owner', 'registeration_number email phone avatar') // Pull vendor details
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error: error.message });
  }
};


export const createRestaurantAdmin = async (req, res) => {
  try {
    const { restaurantName, phone, registeration_number, password, address, deliveryRadiusKm } = req.body;

    const vendorExists = await Vendor.findOne({ registeration_number });
    if (vendorExists) {
      return res.status(400).json({ message: "A vendor with this registration number already exists." });
    }

    const vendorName = req.body.name || restaurantName || "Vendor Owner";
    const vendorEmail = req.body.email || `vendor_${registeration_number}@campusconnect.com`;

    const newVendor = await Vendor.create({
      name: vendorName,
      email: vendorEmail,
      restaurantName,
      phone,
      registeration_number,
      password,
      avatar: ""
    });

    const newRestaurant = await Restaurant.create({
      name: restaurantName, owner: newVendor._id, phone, address,
      deliveryRadiusKm: deliveryRadiusKm || 7,
      isActive: true, menu: []
    });

    res.status(201).json({ success: true, message: "Restaurant onboarded!", restaurantId: newRestaurant._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to provision restaurant admin", error: error.message });
  }
};
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    if (restaurant.owner) {
      await Vendor.findByIdAndDelete(restaurant.owner);
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Restaurant and Vendor account permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting restaurant", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, registrationNumber } = req.body;

    if (!['student', 'student_mod', 'alumni'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be student, student_mod, or alumni." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      registeration_number: registrationNumber || req.body.registeration_number || ""
    });

    res.status(201).json({ success: true, message: `${role} created successfully.`, userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};



export const resetUserPassword = async (req, res) => {
  try {
    const { adminPassword, newStudentPassword } = req.body;
    const targetUserId = req.params.id;

    const adminUser = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(adminPassword, adminUser.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Admin authorization failed. Incorrect admin password." });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found." });
    }

    targetUser.password = newStudentPassword;
    await targetUser.save();

    res.status(200).json({ success: true, message: "User password successfully reset." });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};