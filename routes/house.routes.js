const express = require("express");
const User = require("../models/user.model");
const House = require("../models/house.model");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Create or Update House Details
router.post(
  "/house/:wing/:houseNumber/:userId",
  authMiddleware,
  async (req, res) => {
    const { wing, houseNumber, userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has permission to modify the specified house
      if (
        user.house.wing !== wing ||
        user.house.houseNumber !== parseInt(houseNumber, 10)
      ) {
        return res
          .status(403)
          .json({ error: "You don't have permission to modify this house" });
      }

      // Check if the house already exists for the given userId
      const existingHouse = await House.findOne({
        userId: user._id,
      });

      if (existingHouse) {
        return res.status(400).json({
          error: "House already exists for the specified user",
        });
      }

      // Create a new house
      const newHouse = new House({
        name: req.body.name,
        contactNumber: req.body.contactNumber,
        vehicles: req.body.vehicles,
        familyDetails: req.body.familyDetails,
        currentlyLiving: req.body.currentlyLiving,
        userId: user._id,
        house: {
          wing: wing,
          houseNumber: houseNumber,
        },
      });

      await newHouse.save();
      res.status(201).json({
        message: "House details created successfully",
        house: newHouse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Update House Details
router.put(
  "/house/:wing/:houseNumber/:userId",
  authMiddleware,
  async (req, res) => {
    const { wing, houseNumber, userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has permission to update the specified house
      if (
        !user.house ||
        user.house.wing !== wing ||
        user.house.houseNumber !== parseInt(houseNumber, 10)
      ) {
        return res
          .status(403)
          .json({ error: "You don't have permission to update this house" });
      }

      // Retrieve the existing house
      const existingHouse = await House.findOne({
        userId: user._id,
        "house.wing": wing,
        "house.houseNumber": parseInt(houseNumber, 10),
      });

      if (!existingHouse) {
        return res.status(404).json({ error: "House not found" });
      }

      // Update existing house fields
      existingHouse.name = req.body.name;
      existingHouse.contactNumber = req.body.contactNumber;
      existingHouse.vehicles = req.body.vehicles;
      existingHouse.familyDetails = req.body.familyDetails;
      existingHouse.currentlyLiving = req.body.currentlyLiving;

      // Manually calculate and update totalFamilyMembers
      existingHouse.familyDetails.totalFamilyMembers =
        (existingHouse.familyDetails.ladies || 0) +
        (existingHouse.familyDetails.gents || 0) +
        (existingHouse.familyDetails.boys || 0) +
        (existingHouse.familyDetails.girls || 0);

      // Save the updated house
      await existingHouse.save();

      // Retrieve the updated document
      const updatedHouse = await House.findOne({
        userId: user._id,
        "house.wing": wing,
        "house.houseNumber": parseInt(houseNumber, 10),
      });

      res.status(200).json({
        message: "House details updated successfully",
        house: updatedHouse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get House Details
router.get(
  "/house/:wing/:houseNumber/:userId",
  authMiddleware,
  async (req, res) => {
    const { wing, houseNumber, userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has permission to retrieve the specified house
      if (
        !user.house ||
        user.house.wing !== wing ||
        user.house.houseNumber !== parseInt(houseNumber, 10)
      ) {
        return res
          .status(403)
          .json({ error: "You don't have permission to retrieve this house" });
      }

      // Use findOne to retrieve the house based on userId, wing, and houseNumber
      const house = await House.findOne({
        userId: user._id,
        "house.wing": wing,
        "house.houseNumber": parseInt(houseNumber, 10),
      });

      if (!house) {
        return res.status(404).json({ error: "House not found" });
      }

      res.status(200).json({ house });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get all house details
router.get("/houses", async (req, res) => {
  try {
    const houses = await House.find();
    res.status(200).json({ houses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete House Details
router.delete(
  "/house/:wing/:houseNumber/:userId",
  authMiddleware,
  async (req, res) => {
    const { wing, houseNumber, userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if the user has permission to delete the specified house
      if (
        !user.house ||
        user.house.wing !== wing ||
        user.house.houseNumber !== parseInt(houseNumber, 10)
      ) {
        return res
          .status(403)
          .json({ error: "You don't have permission to delete this house" });
      }

      // Use findOneAndDelete to delete the house based on userId, wing, and houseNumber
      const result = await House.findOneAndDelete({
        userId: user._id,
        "house.wing": wing,
        "house.houseNumber": parseInt(houseNumber, 10),
      });

      if (!result) {
        return res.status(404).json({ error: "House not found" });
      }

      res.status(200).json({ message: "House details deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
module.exports = router;
