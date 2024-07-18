document.addEventListener('DOMContentLoaded', () => {
    const eventSource = new EventSource('/events');
    const tableBody = document.querySelector('#logTable tbody');
  
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      const newRow = document.createElement('tr');
  
      const timestampCell = document.createElement('td');
      timestampCell.textContent = new Date().toLocaleString();
      newRow.appendChild(timestampCell);
  
      const distanceCell = document.createElement('td');
      distanceCell.textContent = data.distance;
      newRow.appendChild(distanceCell);
  
      tableBody.appendChild(newRow);
    };
  
    eventSource.onerror = function() {
      console.error('EventSource failed.');
    };
  });
  