#include <M5Atom.h>
#include "RFID_command.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h> // Biblioteca para criar mensagens JSON
#include <time.h> // Biblioteca para manipular data e hora

// Configurações de rede WiFi e MQTT
const char* ssid = "MEO-F7C000";
const char* password = "786ea359e1";
// const char* ssid = "Wifise";
// const char* password = "12345678";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_client_id = "RFID_reader";
const char* tx_topic = "pj2/uhftag";

WiFiClient espClient;
PubSubClient client(espClient);

UHF_RFID RFID;

String comd = " ";
CardpropertiesInfo card;
ManyInfo cards;
SelectInfo Select;
CardInformationInfo Cardinformation;
QueryInfo Query;
ReadInfo Read;
TestInfo Test;

// Configurações do NTP
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;
const int daylightOffset_sec = 3600;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conectar ao MQTT...");
    if (client.connect(mqtt_client_id, mqtt_user, mqtt_password)) {
      Serial.println("Conectado ao broker MQTT");
    } else {
      Serial.print("Falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void setupTime() {
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Sincronizando com o servidor NTP...");
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Falha na sincronização com o NTP.");
    return;
  }
  Serial.println("Tempo sincronizado com sucesso.");
}

void sendTagMessage(const char* uhftag, const char* room_id) {
  StaticJsonDocument<200> doc;
  
  time_t now;
  time(&now);
  struct tm* timeinfo = localtime(&now);
  char timestamp[20];
  strftime(timestamp, sizeof(timestamp), "%d-%m-%Y:%H:%M", timeinfo);
  
  doc["timestamp"] = timestamp;
  doc["uhftag"] = uhftag;
  doc["room_id"] = room_id;
  // Makes information into JSON format
  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  // Publish JSON Message to the MQTT Broker
  client.publish(tx_topic, jsonBuffer);
}

void setup() {
  M5.begin();
  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, 32, 26);

  setup_wifi();  // Conecta ao WiFi

  client.setServer(mqtt_server, mqtt_port);
  
  setupTime(); // Sincroniza o tempo com o servidor NTP

  RFID.Readcallback();
  RFID.clean_data();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();


  card = RFID.A_single_poll_of_instructions();
  if (card._ERROR.length() == 0) {
      if (card._EPC.length() == 24) {
        Serial.println("RSSI :" + card._RSSI);
        Serial.println("PC :" + card._PC);
        Serial.println("EPC :" + card._EPC);
        Serial.println("CRC :" + card._CRC);
        Serial.println(" ");

        String upperEPC = card._EPC;
        upperEPC.toUpperCase();
        
        sendTagMessage(upperEPC.c_str(), "5");  
      }
      delay(3000);
  }
  RFID.clean_data();
}
