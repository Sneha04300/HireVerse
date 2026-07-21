const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res) => {
  try {
    console.log("REGISTER: entered handler");

    const { name, email, password } = req.body;
    console.log("REGISTER: destructured body", { name, email, password: password ? "***" : undefined });

    console.log("REGISTER: about to User.findOne");
    const userExists = await User.findOne({ email });
    console.log("REGISTER: User.findOne completed", { exists: !!userExists });

    if (userExists) {
      console.log("REGISTER: user already exists, returning 400");
      return res.status(400).json({
        message: "User already exists",
      });
    }

    console.log("REGISTER: about to bcrypt.genSalt");
    const salt = await bcrypt.genSalt(10);
    console.log("REGISTER: bcrypt.genSalt completed");

    console.log("REGISTER: about to bcrypt.hash");
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("REGISTER: bcrypt.hash completed");

    console.log("REGISTER: about to User.create");
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("REGISTER: User.create completed", { userId: user._id });

    console.log("REGISTER: about to send 201 response");
    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
      },
    });
    console.log("REGISTER: 201 response sent successfully");
  } catch (error) {
    console.log("REGISTER: caught error", error.message);
    res.status(500).json({
      message: error.message,
    });
    console.log("REGISTER: 500 error response sent");
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Profile (Protected Route)
const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};