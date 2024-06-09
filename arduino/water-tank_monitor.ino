#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Make sure to install ArduinoJson library

const char* ssid = "YourWiFiNetwork";
const char* password = "YourWiFiPassword";

const char* serverName = "http://192.168.1.100:3000/endpoint"; // Replace with your server IP and port

const int triggerPin = 12;
const int echoPin = 13;

void setup() {
    Serial.begin(115200);

    pinMode(triggerPin, OUTPUT);
    pinMode(echoPin, INPUT);

    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    Serial.println("Connected to WiFi");
}

float readUltrasonicDistance() {
    digitalWrite(triggerPin, LOW);
    delayMicroseconds(2);
    digitalWrite(triggerPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(triggerPin, LOW);

    long duration = pulseIn(echoPin, HIGH);
    float distance = (duration * 0.034) / 2; // Convert to cm
    return distance;
}

void sendJsonData(float distance) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");

        StaticJsonDocument<200> doc;
        doc["sensor"] = "ultrasonic";
        doc["distance"] = distance;

        String jsonString;
        serializeJson(doc, jsonString);

        int httpResponseCode = http.POST(jsonString);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println(httpResponseCode);
            Serial.println(response);
        } else {
            Serial.print("Error on sending POST: ");
            Serial.println(httpResponseCode);
        }

        http.end();
    } else {
        Serial.println("WiFi not connected");
    }
}

void loop() {
    float distance = readUltrasonicDistance();
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");

    sendJsonData(distance);

    delay(5000); // Send data every 5 seconds
}
