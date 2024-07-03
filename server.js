const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

let latestSensorData = null;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/endpoint', (req, res) => {
  latestSensorData = req.body;
  console.log('Received data from Arduino:', latestSensorData);
  res.status(200).send({ message: 'Data received successfully' });
});

app.get('/sensor-data', (req, res) => {
  res.status(200).send(latestSensorData);
});

app.get('/user', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.post('/saveUser', (req, res) => {
  const user = req.body;

  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading file:', err);
      return res.status(500).send('Internal Server Error');
    }

    const users = data ? JSON.parse(data) : [];
    users.push(user);

    fs.writeFile('users.json', JSON.stringify(users, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Internal Server Error');
      }
      res.send('User data saved successfully!');
    });
  });
});

app.get('/getUsers', (req, res) => {
  fs.readFile('users.json', 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Error reading file:', err);
      return res.status(500).send('Internal Server Error');
    }

    const users = data ? JSON.parse(data) : [];
    res.status(200).json(users);
  });
});

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'users.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
