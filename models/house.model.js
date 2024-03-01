const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  house: {
    wing: { type: String, required: true, enum: ["A", "B"] },
    houseNumber: { type: Number, required: true, min: 1, max: 250 },
  },
  name: { type: String, required: true, set: (value) => value.toUpperCase() },
  contactNumber: { type: String, required: true, validate: /^[0-9]{10}$/ },
  vehicles: [
    {
      vehicleType: {
        type: String,
        required: true,
        enum: ["Scooter", "Bike", "Car", "Bus", "Auto"],
      },
      vehicleModel: { type: String, required: true },
      vehicleFuelType: {
        type: String,
        required: true,
        enum: ["Petrol", "Diesel", "Compressed Natural Gas (CNG)", "Electric"],
      },
      vehicleRegistrationNumber: {
        type: String,
        required: true,
        unique: true,
        set: (value) => value.toUpperCase(),
      },
    },
  ],
  familyDetails: {
    ladies: { type: Number, default: 0 },
    gents: { type: Number, default: 0 },
    boys: { type: Number, default: 0 },
    girls: { type: Number, default: 0 },
    totalFamilyMembers: { type: Number },
  },
  currentlyLiving: {
    type: String,
    required: true,
    enum: ["Yes", "No"],
    default: "Yes",
  },
});

houseSchema.pre("save", async function (next) {
  this.familyDetails.totalFamilyMembers =
    (this.familyDetails.ladies || 0) +
    (this.familyDetails.gents || 0) +
    (this.familyDetails.boys || 0) +
    (this.familyDetails.girls || 0);
  next();
});

const House = mongoose.model("House", houseSchema);

module.exports = House;
