void handleRoot() {
    String content = "<!DOCTYPE HTML>\n";
    content += "<html><head><title>Sonar Sensor Data</title>";
    content += "<style>";
    // Add your CSS styles here
    content += "body { font-family: Arial, sans-serif; }";
    content += ".container { text-align: center; margin-top: 50px; }";
    content += "</style>";
    content += "</head><body>";
    content += "<div class='container'>";
    content += "<h1>Sonar Sensor Data</h1>";
    content += "<h2 id='distance'>--</h2>";
    content += "</div>";
    content += "<script>";
    // Add your JavaScript code here
    content += "setInterval(getDistance, 1000);";
    content += "function getDistance() {";
    content += "  fetch('/distance')";
    content += "  .then(response => response.text())";
    content += "  .then(data => {";
    content += "    document.getElementById('distance').innerText = 'Distance: ' + data + ' cm';";
    content += "  });";
    content += "}";
    content += "</script>";
    content += "</body></html>";
}
#include <WiFi.h>
#include <WebServer.h>
#include <Ultrasonic.h>

const char* ssid = "YourWiFiNetwork";
const char* password = "YourWiFiPassword";

WebServer server(80);

// Sonar sensor pins
#define TRIGGER_PIN 12
#define ECHO_PIN 13

Ultrasonic sonar(TRIGGER_PIN, ECHO_PIN);

void handleRoot() {
    String content = "<!DOCTYPE HTML>\n";
    content += "<html><head><title>Sonar Sensor Data</title>";
    content += "<style>";
    // Add your CSS styles here
    content += "body { font-family: Arial, sans-serif; }";
    content += ".container { text-align: center; margin-top: 50px; }";
    content += "</style>";
    content += "</head><body>";
    content += "<div class='container'>";
    content += "<h1>Sonar Sensor Data</h1>";
    content += "<h2 id='distance'>--</h2>";
    content += "</div>";
    content += "<script>";
    // Add your JavaScript code here
    content += "setInterval(getDistance, 1000);";
    content += "function getDistance() {";
    content += "  fetch('/distance')";
    content += "  .then(response => response.text())";
    content += "  .then(data => {";
    content += "    document.getElementById('distance').innerText = 'Distance: ' + data + ' cm';";
    content += "  });";
    content += "}";
    content += "</script>";
    content += "</body></html>";
  
    server.send(200, "text/html", content);
}

void handleDistance() {
    float distance = sonar.read();
    server.send(200, "text/plain", String(distance));
}

void setup() {
    Serial.begin(115200);
    
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    Serial.println("Connected to WiFi");
  
    server.on("/", handleRoot);
    server.on("/distance", handleDistance);
    server.begin();
    Serial.println("HTTP server started");
}

void loop() {
    server.handleClient();
}