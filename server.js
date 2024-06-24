const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

let latestSensorData = null;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/endpoint', (req, res) => {
    latestSensorData = req.body;
    console.log('Received data from Arduino:', latestSensorData);
    res.status(200).send({ message: 'Data received successfully' });
});

app.get('/sensor-data', (req, res) => {
    res.status(200).send(latestSensorData);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
