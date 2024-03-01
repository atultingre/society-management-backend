const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { email, password, house } = req.body;

    const existingUser = await User.findOne({
      "house.wing": house.wing,
      "house.houseNumber": house.houseNumber,
    });
    if (existingUser) {
      return res.status(400).json({ error: "House is already taken" });
    }
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      house,
      admin: false,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: "Signup successful", newUser });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      // If the error is a validation error (e.g., due to mongoose validation), send detailed validation errors to the front end
      const validationErrors = Object.values(error.errors).map(
        (e) => e.message
      );
      res.status(400).json({ errors: validationErrors });
    } else {
      // For other errors, send a generic error message
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      "atultingre.work@gmail.com"
    );

    // Send the token as a response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        userId: user._id,
        email: user.email,
        house: user.house,
        admin: user.admin,
      },
    });
    console.log("user: ", user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
