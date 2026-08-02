import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    registeration_number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "campus_admin", "student", "student_mod", "alumni", "rider", "vendor", "admin"],
      default: "student",
    },
    department: { type: String, default: "" },
    program:{type: String, default: ""},
    semester: { type: Number, default: 0 },
    section:{ type: String, default:""},
    avatar: {
      type: String,
      default: "https://ui-avatars.com/api/?name=User&background=random", // Nice fallback!
    },
    isNameHidden: { type: Boolean, default: false },
    pushSubscription: { type: Object, default: null },
    images: [String],
    careerBio: {
      type: String,
      default: "",
    },
    careerDept: { type: String, default: "" },
    careerSkills: [
      {
        name: { type: String, required: true },
        level: { type: Number, default: 70 },
      },
    ],
    savedCareerPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CareerThread",
      },
    ],
    activeWarning: {
      hasWarning: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      details: { type: String, default: "" },
      issuedAt: { type: Date },
      issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      acknowledged: { type: Boolean, default: true }
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
