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
      enum: ["student", "alumni", "student_mod", "admin", "vendor", "campus_admin"],
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
    images: [String],
    careerBio: {
      type: String,
      default: "Aspiring Software Engineer & Full-Stack Developer | Passionate about DSA, Web Dev & AI | Lifelong learner.",
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
