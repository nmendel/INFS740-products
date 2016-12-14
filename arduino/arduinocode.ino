#include <FS.h>                   //this needs to be first, or it all crashes and burns...

#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino
#include <PubSubClient.h>
//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager

#include <ArduinoJson.h>          //https://github.com/bblanchon/ArduinoJson
WiFiClient espClient;
PubSubClient client(espClient);

#define the_mqtt_server "104.236.210.175"
#define the_mqtt_user "mm"
#define the_mqtt_password ""
#define the_topic1 "infs2"
#define mqtt_client_name "devclass" //this needs to be unique for each unit

#define device_id "***BuyBot config***"

char weight_measure[50] = "15";


//define your default values here, if there are different values in config.json, they are overwritten.
char mqtt_server[200] = "104.236.210.175";
char mqtt_port[436] = "1883";
//char blynk_token[34] = "YOUR_BLYNK_TOKEN";
int inputPin = 4; 
//flag for saving data
bool shouldSaveConfig = false;

//callback notifying us of the need to save config
void saveConfigCallback () {
  Serial.println("Should save config");
  shouldSaveConfig = true;
}


void setup() {
  // put your setup code here, to run once:
    pinMode(12, OUTPUT); // GREEN
  pinMode(4, OUTPUT); //RED
  Serial.begin(115200);

  digitalWrite(4, HIGH);   // turn the LED on (RED is the voltage level)
    //client.setServer(the_mqtt_server, 1883);
    //pinMode(inputPin, INPUT);     // declare sensor as input
  Serial.println();

  //clean FS, for testing
  //  SPIFFS.format();

  //read configuration from FS json
  Serial.println("mounting FS...");
  //delay(4000);

  if (SPIFFS.begin()) {
    Serial.println("mounted file system");
    if (SPIFFS.exists("/config.json")) {
      //file exists, reading and loading
      Serial.println("reading config file");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("opened config file");
        size_t size = configFile.size();
        // Allocate a buffer to store contents of the file.
        std::unique_ptr<char[]> buf(new char[size]);

        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\nparsed json");

          //strcpy(mqtt_server, json["mqtt_server"]);
          //strcpy(mqtt_port, json["mqtt_port"]);
          //strcpy(blynk_token, json["blynk_token"]);

        } else {
          Serial.println("failed to load json config");
        }
      }
    }
  } else {
    Serial.println("failed to mount FS");
    delay(1000);
  }
  //end read



  // The extra parameters to be configured (can be either global or just in the setup)
  // After connecting, parameter.getValue() will get you the configured value
  // id/name placeholder/prompt default length
  WiFiManagerParameter custom_mqtt_server("server", "First and Last Name", mqtt_server, 140);
  WiFiManagerParameter custom_mqtt_port("port", "Amazon Link", mqtt_port, 436);
  //WiFiManagerParameter custom_blynk_token("blynk", "blynk token", blynk_token, 32);

  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;

  //set config save notify callback
  wifiManager.setSaveConfigCallback(saveConfigCallback);

  //set static ip
  wifiManager.setSTAStaticIPConfig(IPAddress(192,168,0,99), IPAddress(192,168,0,1), IPAddress(255,255,255,0));
  
  //add all your parameters here
  //wifiManager.addParameter(&custom_mqtt_server);
  //wifiManager.addParameter(&custom_mqtt_port);
  //wifiManager.addParameter(&custom_blynk_token);

  //reset settings - for testing
  wifiManager.resetSettings();

  //set minimu quality of signal so it ignores AP's under that quality
  //defaults to 8%
  //wifiManager.setMinimumSignalQuality();
  
  //sets timeout until configuration portal gets turned off
  //useful to make it all retry or go to sleep
  //in seconds
  //wifiManager.setTimeout(120);

  //fetches ssid and pass and tries to connect
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP"
  //and goes into a blocking loop awaiting configuration

  String wifi_url = String(device_id) + String(" Wifi Config");
  
  if (!wifiManager.autoConnect(device_id, "password")) {
    Serial.println("failed to connect and hit timeout");
      digitalWrite(4, HIGH);
      delay(200);
      digitalWrite(4, LOW);
      delay(200);
      digitalWrite(4, HIGH);
      delay(200);
      digitalWrite(4, LOW);
      delay(200);
    
    delay(3000);
    //reset and try again, or maybe put it to deep sleep
    //ESP.reset();
    //delay(5000);
  }

  //if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");

  //read updated parameters
  strcpy(mqtt_server, custom_mqtt_server.getValue());
  strcpy(mqtt_port, custom_mqtt_port.getValue());
  //strcpy(blynk_token, custom_blynk_token.getValue());

  //save the custom parameters to FS
  if (shouldSaveConfig) {
    Serial.println("saving config");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    json["mqtt_server"] = mqtt_server;
    json["mqtt_port"] = mqtt_port;
    //json["blynk_token"] = blynk_token;

    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

    json.printTo(Serial);
    json.printTo(configFile);
    configFile.close();
    //end save
  }

  Serial.println("local ip");
  Serial.println(WiFi.localIP());
  
  //Serial.println(mqtt_server);

  //Serial.println(custom_mqtt_port);
  digitalWrite(4, LOW);    // turn the LED off by making the voltage LOW
  delay(300);
  digitalWrite(12, HIGH);
  delay(300);
    digitalWrite(12, LOW);
    delay(300);
      digitalWrite(12, HIGH);
  delay(300);
    digitalWrite(12, LOW);
    delay(300);
      digitalWrite(12, HIGH);
  delay(300);
    digitalWrite(12, LOW);
    delay(300);
  
}

void pubMQTT(String topic,String topic_val){
     //digitalWrite(4, HIGH);
     //delay(500);
    Serial.print("Newest topic " + topic + " value:");
    Serial.println(String(topic_val).c_str());
    client.publish(topic.c_str(), String(topic_val).c_str(), true);
    //delay(500);
    //digitalWrite(4, LOW);
}

void reconnect() {
    // Loop until we're reconnected
    //client.setServer(mqtt_server, 1883);
    while (!client.connected()) {
        Serial.print("Attempting MQTT connection...");
        // Attempt to connect
        if (client.connect("TestMQTT")) { //* See //NOTE below
            Serial.println("connected");

            //flash green light to say that we are connected again
            
                digitalWrite(12, HIGH);
                delay(200);
                digitalWrite(12, LOW);
                delay(200);
                digitalWrite(12, HIGH);
                delay(200);
                digitalWrite(12, LOW);
                delay(200);
                
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" try again in 5 seconds");
            // Wait 5 seconds before retrying
            delay(5000);
                digitalWrite(4, HIGH);
                delay(200);
                digitalWrite(4, LOW);
                delay(200);
                digitalWrite(4, HIGH);
                delay(200);
                digitalWrite(4, LOW);
                delay(200);
        }
    }
}

void loop() {
client.setServer(the_mqtt_server, 1883);
  if (!client.connected()) {
 reconnect();
}

  // put your main code here, to run repeatedly:
  Serial.println("test");
  Serial.println("user name");
  Serial.println(mqtt_server);
  Serial.println("amazon link");
  Serial.println(mqtt_port);
  Serial.println("user name");
  Serial.println(the_mqtt_server);


  String message_to_send = String("{\"DeviceID\":\"") +  String(device_id) + "\", \"Current_Weight\":\"" + String(weight_measure) + "\"}";

  //String message_to_send = String("{") + String("\"DeviceInfo\"") + String(":[{\"DeviceID\":\"") +  String(device_id) + "\", \"Current_Weight\":\"" + String(weight_measure) + "\"}]}";
  //String message_to_send = String(mqtt_server) + " " + String(mqtt_port);
  Serial.println(message_to_send);

  
  digitalWrite(12, HIGH);
  delay(300);
   digitalWrite(12, LOW);
  delay(300);
  //pubMQTT("1_purchase",message_to_send);
    //pubMQTT("1_purchase",mqtt_server);
  //pubMQTT("infs740",message_to_send);
  delay(5000);
   client.loop();
    digitalWrite(12, HIGH);
    delay(300);
    digitalWrite(12, LOW);
   delay(1000);  

}