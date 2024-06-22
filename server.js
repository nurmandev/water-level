const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static('web'));

// Endpoint to simulate distance sensor data
app.get('/endpoint', (req, res) => {
    const distance = Math.floor(Math.random() * 30); // Simulate distance in cm
    res.json({ distance });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
