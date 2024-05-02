var ctx = document.getElementById('historyChart');
ctx.height = 65;

var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: '# height',
            data: [12, 19, 3, 5, 2, 3, 10],
            fill: true,
            tension: 0.2,
            pointStyle: 'circle',
            borderWidth: 7,
            backgroundColor: [
                'rgba(83, 0, 145, 0.3)',
            ],
            borderColor: [
                'rgba(223, 181, 255, 1)',
            ],
            pointBorderColor: [
                'rgba(255, 255, 255, 1)',
            ],
            borderWidth: 1
        }]
    }
});

const API_KEY = "328e92b6eb2fbc99fc9d31ea6077f505"
const API_URL = "https://api.openweathermap.org/data/2.5/weather?q=Merchtem&appid=" + API_KEY
const ICO_URL = " http://openweathermap.org/img/wn/" // + "@2x.png"

fetch(API_URL)
  .then(response => response.json())
  .then(data => console.log(data));

//place
fetch(API_URL)
  .then(response => response.json())
  .then(data => document.getElementById("current_place").innerHTML += data["name"]);

//weather  
fetch(API_URL)
  .then(response => response.json())
  .then(data => document.getElementById("current_weather").innerHTML = "<img height='50' width='50' src='" + ICO_URL + data["weather"][0]["icon"] + "@2x.png'> " + data["weather"][0]["description"]);

//temperature
fetch(API_URL)
  .then(response => response.json())
  .then(data => document.getElementById("current_temperature").innerHTML += (data["main"]["temp"] - 273.15).toFixed(2) + "°C");

//humidity
fetch(API_URL)
  .then(response => response.json())
  .then(data => document.getElementById("current_humidity").innerHTML += data["main"]["humidity"] + "%");


var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;
document.getElementById("current_date").innerHTML += today;