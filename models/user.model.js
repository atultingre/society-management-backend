const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  house: {
    wing: { type: String, required: true, enum: ["A", "B"] },
    houseNumber: { type: Number, required: true, min: 1, max: 250 },
  },
  admin: { type: Boolean, required: true, default: false },
});

userSchema.index({ "house.wing": 1, "house.houseNumber": 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
