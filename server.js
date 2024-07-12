const express = require("express");
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

app.post("/endpoint", (req, res) => {
  latestSensorData = req.body;
  console.log("Received data from Arduino:", latestSensorData);
  res.status(200).send({ message: "Data received successfully" });
});

app.get("/sensor-data", (req, res) => {
  res.status(200).send(latestSensorData);
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
