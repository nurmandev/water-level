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

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ username, email, password: hashedPassword });
  await user.save();

  req.session.user = user;
  res.redirect('/dashboard');
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.user = user;
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
  } else {
    res.redirect("/");
  }
});

app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ 
      username: req.session.user.username,
      email: req.session.user.email
    });
  } else {
    res.json({ username: 'Guest', email: '' });
  }
});

// app.get('/user', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'user.html'));
// });

// app.post('/saveUser', (req, res) => {
//   const user = req.body;

//   fs.readFile('users.json', 'utf8', (err, data) => {
//     if (err && err.code !== 'ENOENT') {
//       console.error('Error reading file:', err);
//       return res.status(500).send('Internal Server Error');
//     }

//     const users = data ? JSON.parse(data) : [];
//     users.push(user);

//     fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
//       if (err) {
//         console.error('Error writing file:', err);
//         return res.status(500).send('Internal Server Error');
//       }
//       res.send('User data saved successfully!');
//     });
//   });
// });

// app.get('/getUsers', (req, res) => {
//   fs.readFile('users.json', 'utf8', (err, data) => {
//     if (err && err.code !== 'ENOENT') {
//       console.error('Error reading file:', err);
//       return res.status(500).send('Internal Server Error');
//     }

//     const users = data ? JSON.parse(data) : [];
//     res.status(200).json(users);
//   });
// });

// app.get('/users', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'users.html'));
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
