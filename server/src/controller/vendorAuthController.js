import bcrypt from "bcryptjs";
import Vendor from "../models/Vendor.js";
import generateToken from "../utils/generateToken.js";

export const loginVendor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    if (vendor) {
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (isMatch) {
        res.json({
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          registeration_number: vendor.registeration_number,
          role: vendor.role,
          restaurantName: vendor.restaurantName,
          phone: vendor.phone,
          avatar: vendor.avatar,
          token: generateToken(vendor._id),
        });
      } else {
        res.status(401).json({ message: "Invalid email or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const registerVendor = async (req, res) => {
  const { name, email, registeration_number, password, role, restaurantName, phone, avatar } = req.body;

  try {
    const vendorExists = await Vendor.findOne({ email });

    if (vendorExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const vendor = await Vendor.create({
      name,
      email,
      registeration_number,
      password,
      role: role || "vendor",
      restaurantName: restaurantName || "",
      phone: phone || "",
      avatar, 
    });

    if (vendor) {
      res.status(201).json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        registeration_number: vendor.registeration_number,
        role: vendor.role,
        restaurantName: vendor.restaurantName,
        phone: vendor.phone,
        avatar: vendor.avatar,
        token: generateToken(vendor._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  const vendor = await Vendor.findById(req.user._id);

  if (vendor) {
    res.json({
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      registeration_number: vendor.registeration_number,
      role: vendor.role,
      restaurantName: vendor.restaurantName,
      phone: vendor.phone,
      avatar: vendor.avatar,
    });
  } else {
    res.status(404).json({ message: "Vendor not found" });
  }
};

export const updateVendorAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const imageUrl = req.file.path;

    const vendor = await Vendor.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }, 
    );

    res.status(200).json({
      message: "Profile picture updated successfully!",
      avatar: vendor.avatar,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during upload", error: error.message });
  }
};
