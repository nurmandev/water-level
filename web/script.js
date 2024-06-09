document.addEventListener('DOMContentLoaded', () => {
    const distanceElement = document.getElementById('distance');
    const statusElement = document.getElementById('status');
    const FULL_TANK_THRESHOLD = 10; // Example threshold in cm

    function fetchDistance() {
        // Fetch distance from the API endpoint
        fetch('/endpoint')
            .then(response => response.json())
            .then(data => {
                const distance = data.distance;
                distanceElement.textContent = `Distance: ${distance} cm`;

                if (distance <= FULL_TANK_THRESHOLD) {
                    statusElement.textContent = 'Status: Water tank is full!';
                    alert('Water tank is full!');
                } else {
                    statusElement.textContent = 'Status: Monitoring...';
                }
            })
            .catch(error => {
                console.error('Error fetching distance:', error);
                distanceElement.textContent = 'Distance: Error';
                statusElement.textContent = 'Status: Error';
            });
    }

    // Fetch the distance every 5 seconds
    fetchDistance();
    setInterval(fetchDistance, 5000);
});