const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const port = 3000;

let latestSensorData = null;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "proficient",
    resave: false,
    saveUninitialized: true,
  })
);

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://resume:1234@cluster0.8114dlp.mongodb.net/water_level_db?retryWrites=true&w=majority&appName=Cluster0"
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.post("/endpoint", (req, res) => {
  latestSensorData = req.body;
  console.log("Received data from Arduino:", latestSensorData);
  res.status(200).send({ message: "Data received successfully" });
});

app.get("/sensor-data", (req, res) => {
  res.status(200).send(latestSensorData);
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, email, password: hashedPassword });
  await user.save();

  req.session.user = user;
  res.redirect("/dashboard");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    res.redirect("/dashboard.html");
  } else {
    res.redirect("/login.html");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } else {
    res.redirect("/");
  }
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({
      username: req.session.user.username,
      email: req.session.user.email,
    });
  } else {
    res.json({ username: "Guest", email: " " });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
