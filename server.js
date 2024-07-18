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
const port = 3000;

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
  service: "gmail",
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
    distance: req.query.distance || 100, // Default distance is 10cm
  };

  latestSensorData = testData;
  console.log("Test data:", testData);

  if (testData.distance <= 5) {
    // Water is full (distance is low)
    const users = await User.find({});
    users.forEach((user) => {
      sendEmail(
        "Water Tank Alert",
        `Dear ${user.username}, your water tank is low.`,
        user.email
      );
    });
  } else if (testData.distance >= 50) {
    // Water is low (distance is high)
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

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // flush the headers to establish SSE with the client

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client !== res);
  });
});

function sendEvent(data) {
  clients.forEach((client) =>
    client.write(`data: ${JSON.stringify(data)}\n\n`)
  );
}

// ENDPOINTS======================================>ENDPOINTS===================>
app.post("/endpoint", async (req, res) => {
  latestSensorData = req.body;
  console.log("Received data from Arduino:", latestSensorData);

  if (req.body.distance <= 5) {
    // Water is full (distance is low)
    const users = await User.find({});
    users.forEach((user) => {
      sendEmail(
        "Water Tank Alert",
        `Dear ${user.username}, your water tank is low.`,
        user.email
      );
    });
  } else if (req.body.distance >= 50) {
    // Water is low (distance is high)
    const users = await User.find({});
    users.forEach((user) => {
      sendEmail(
        "Water Tank Alert",
        `Dear ${user.username}, water tank is full.`,
        user.email
      );
    });
  }

  res.status(200).send({ message: "Data received successfully" });
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
  res.render("index");
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
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.render("dashboard", { user: req.session.user });
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
