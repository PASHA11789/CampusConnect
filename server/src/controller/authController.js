import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const safeError = (error) =>
  process.env.NODE_ENV === "development" ? error.message : "Internal server error";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const loginUser = async (req, res) => {
  const startTime = process.hrtime.bigint();
  const rawIdentifier = (
    req.body.registrationNumber ||
    req.body.registeration_number ||
    req.body.registration_no ||
    req.body.identifier ||
    req.body.username ||
    ""
  ).trim();
  const { password, isCMS, portal } = req.body;

  try {
    if (!rawIdentifier || !password) {
      return res.status(400).json({ message: "Registration number and password are required" });
    }

    // Strictly disallow email login
    if (rawIdentifier.includes("@")) {
      return res.status(400).json({ 
        message: "Email sign-in is disabled. Please enter your Registration Number (e.g. 2022f-mulbscs-093)." 
      });
    }

    const normalizedIdentifier = rawIdentifier.toLowerCase();

    // 1. Try fast exact indexed lookup first (< 2ms execution time)
    let user = await User.findOne({
      $or: [
        { registeration_number: rawIdentifier },
        { registeration_number: normalizedIdentifier },
        { registration_number: rawIdentifier },
        { registration_number: normalizedIdentifier },
        { registration_no: rawIdentifier },
        { registration_no: normalizedIdentifier },
        { registrationNumber: rawIdentifier },
      ],
    }).lean();

    // 2. Fall back to case-insensitive regex query if exact match is not found
    if (!user) {
      const escaped = escapeRegex(rawIdentifier);
      const orConditions = [
        { registeration_number: { $regex: new RegExp(`^${escaped}$`, "i") } },
        { registration_number: { $regex: new RegExp(`^${escaped}$`, "i") } },
        { registration_no: { $regex: new RegExp(`^${escaped}$`, "i") } },
        { registrationNumber: { $regex: new RegExp(`^${escaped}$`, "i") } },
      ];
      user = await User.findOne({ $or: orConditions }).lean();
    }

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Enforce CMS portal restrictions: Only students can log in to the Minhaj CMS
        if (isCMS || portal === "cms") {
          const allowedRoles = ["student", "student_mod"];
          if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({
              message: "Access restricted: Only Minhaj University students can sign in to the CMS Portal."
            });
          }
        }

        const durationMs = (Number(process.hrtime.bigint() - startTime) / 1e6).toFixed(1);
        res.setHeader("Server-Timing", `auth;dur=${durationMs};desc="Sign-In Processing"`);
        console.log(`⚡ [Auth Performance] Sign-in for ${user.registeration_number} completed in ${durationMs} ms (< 3000ms requirement)`);

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
          responseTimeMs: parseFloat(durationMs),
        });
      } else {
        res.status(401).json({ message: "Invalid registration number or password" });
      }
    } else {
      res.status(401).json({ message: "Invalid registration number or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "server error", error: safeError(error) });
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
    res.status(500).json({ message: "Server Error", error: safeError(error) });
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
    res.status(500).json({ message: "Upload failed", error: safeError(error) });
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
      .json({ message: "Server error during upload", error: safeError(error) });
  }
};
