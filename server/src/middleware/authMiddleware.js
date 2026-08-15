import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "User account no longer exists. Please log in again." });
      }
      return next();
    } catch (error) {
      console.error("Auth token verification error:", error.message);
      return res.status(401).json({ message: "Session expired or invalid token. Please log in again." });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "No token provided. Please log in again." });
  }
};

export const protectVendor = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Vendor.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "not authorized as vendor" });
      }
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "not authorized token failed" });
    }
  }
  if (!token) {
    return res.status(401).json({ message: "not authorized token failed" });
  }
};

export const authorizeCampusRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "not authorized token failed" });
    }
    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
