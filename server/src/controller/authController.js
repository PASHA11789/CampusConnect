import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          registeration_number: user.registeration_number,
          role: user.role,
          department: user.department,
          program: user.program,
          semester: user.semester,
          section: user.section,
          avatar: user.avatar,
          token: generateToken(user._id),
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

export const registerUser = async (req, res) => {
  const { name, email, registeration_number, password, role, department,program, semester, section,avatar } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      registeration_number,
      password,
      role: role || "student",
      department,
      program: program || "BS",
      semester: semester|| 0,
      section: section || "",
      avatar, 
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        registeration_number: user.registeration_number,
        role: user.role,
        department: user.department,
        program: user.program,
        semester: user.semester,
        section: user.section,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image uploaded" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: req.file.path,
      },
      { new: true },
    );

    res.json({ message: "Profile Uploaded", avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      registeration_number: user.registeration_number,
      role: user.role,
      program: user.program,
      avatar: user.avatar,
      department: user.department,
      semester: user.semester,
      section:user.section
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

export const updateUserAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

   
    const imageUrl = req.file.path;

    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }, 
    );

    res.status(200).json({
      message: "Profile picture updated successfully!",
      avatar: user.avatar,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during upload", error: error.message });
  }
};
