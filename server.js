const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = 5000;

let latestSensorData = null;
let clients = [];

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
  "mongodb+srv://resume:1234@cluster0.8114dlp.mongodb.net/water-db?retryWrites=true&w=majority&appName=Cluster0"
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  age: String,
  height: String,
  weight: String,
});

const User = mongoose.model("User", userSchema);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: "smpt.gmail.com",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
function sendEmail(subject, text, to) {
  const mailOptions = {
    from: "WATER LEVEL",
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

// Test route
app.get("/test-water-level", async (req, res) => {
  const testData = {
    sensor: "ultrasonic",
    weight: req.query.weight || 100, // Default weight is 10cm
  };

  latestSensorData = testData;
  console.log("Test data:", testData);

  if (testData.weight <= 5) {
    // Water is full (weight is low)
    const users = await User.find({});
    users.forEach((user) => {
      sendEmail(
        "Water Tank Alert",
        `Dear ${user.username}, your water tank is low.`,
        user.email
      );
    });
  } else if (testData.weight >= 50) {
    // Water is low (weight is high)
    const users = await User.find({});
    users.forEach((user) => {
      sendEmail(
        "Water Tank Alert",
        `Dear ${user.username}, your water tank is full.`,
        user.email
      );
    });
  }

  res.status(200).send({ message: "Test data processed successfully" });
});

// ENDPOINTS==================================>ENDPOINTS<=======================ENDPOINTS
app.post("/endpoint", async (req, res) => {
  try {
    // Check if the request body has the necessary data
    if (!req.body || typeof req.body.weight === "undefined") {
      return res
        .status(400)
        .send({ message: "Invalid data format, weight is required" });
    }

    // Convert weight to a number if it's a string
    let weight = req.body.weight;
    if (typeof weight === "string") {
      weight = parseFloat(weight);
    }

    // Check if the weight is a valid number
    if (isNaN(weight)) {
      return res
        .status(400)
        .send({ message: "Invalid data format, weight must be a number" });
    }

    latestSensorData = { weight };
    console.log("Received data from Arduino:", latestSensorData);

    // Fetch all users from the database
    const users = await User.find({});

    if (weight <= 5) {
      // Water is full (weight is low)
      users.forEach((user) => {
        sendEmail(
          "Water Tank Alert",
          `Dear ${user.username}, your water tank is low.`,
          user.email
        );
      });
    } else if (weight >= 50) {
      // Water is low (weight is high)
      users.forEach((user) => {
        sendEmail(
          "Water Tank Alert",
          `Dear ${user.username}, your water tank is full.`,
          user.email
        );
      });
    }

    res.status(200).send({ message: "Data received successfully" });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/sensor-data", (req, res) => {
  res.status(200).send(latestSensorData);
});

app.get("/sensor", (req, res) => {
  res.render("sensor-data-page");
});

app.get("/data", (req, res) => {
  res.json(latestSensorData);
});

app.post("/register", async (req, res) => {
  const { username, email, password, age, height, weight } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPassword,
    age,
    height,
    weight,
  });
  await user.save();

  req.session.user = user;
  res.redirect("/dashboard");
});

app.get("/", (req, res) => {
  res.render("index", { sensorData: latestSensorData });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    res.redirect("/sensor-data-page");
  } else {
    res.redirect("/login");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", {
      user: req.session.user,
      sensorData: latestSensorData,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/water", (req, res) => {
  if (req.session.user) {
    res.render("water", { user: req.session.user });
  } else {
    res.redirect("/login");
  }
});

app.get("/sensor-data-page", (req, res) => {
  if (req.session.user) {
    res.render("sensor-data-page", {
      user: req.session.user,
      sensorData: latestSensorData,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/dashboard");
    }
    res.redirect("/login");
  });
});

app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({
      username: req.session.user.username,
      email: req.session.user.email,
      age: req.session.user.age,
      height: req.session.user.height,
      weight: req.session.user.weight,
    });
  } else {
    res.json({ username: "", email: "", age: "", height: "", weight: "" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
