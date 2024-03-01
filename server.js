const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const houseRoutes = require("./routes/house.routes");

const app = express();
const port = 5000;

app.use(express.json());

app.use(cors());

// Connect to MongoDB
mongoose.connect("mongodb+srv://atultingre:atultingre@cluster0.9cdotyl.mongodb.net/societyManagement", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/auth", authRoutes);
app.use("/api", houseRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
