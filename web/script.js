document.addEventListener('DOMContentLoaded', () => {
    const tankProgress = document.getElementById('tankProgress');
    const tankPercentage = document.getElementById('tankPercentage');
    const distanceElement = document.getElementById('distance');
    const statusElement = document.getElementById('status');
    const FULL_TANK_THRESHOLD = 10; // Example threshold in cm

    function fetchDistance() {
        fetch('/endpoint')
            .then(response => response.json())
            .then(data => {
                const distance = data.distance;
                const percentage = Math.max(0, Math.min(100, 100 - (distance / FULL_TANK_THRESHOLD) * 100));
                tankProgress.style.height = `${percentage}%`;
                tankProgress.setAttribute('aria-valuenow', percentage);
                tankPercentage.textContent = `${percentage}%`;
                distanceElement.textContent = `Tank is filled up for: ${percentage}%`;

                if (percentage >= 100) {
                    alert('Water tank is full!');
                    statusElement.textContent = 'Status: Water tank is full!';
                } else {
                    statusElement.textContent = 'Status: Monitoring...';
                }
            })
            .catch(error => {
                console.error('Error fetching distance:', error);
                distanceElement.textContent = 'Tank is filled up for: Error';
                statusElement.textContent = 'Status: Error';
            });
    }

    fetchDistance();
    setInterval(fetchDistance, 5000);
});
