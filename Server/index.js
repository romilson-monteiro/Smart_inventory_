import mqtt from 'mqtt';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { api } from "./routes/index.js";
import { projeto2_db } from "./config/context/database.js";
import { addMoviment } from "./controllers/objects.controller.js";


dotenv.config();

const server = express();

const clientURL = "*";

const corsOptions = {
  origin: clientURL,
};
server.use(cors(corsOptions));

server.use(morgan("short"));

server.use(express.static('public'));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api", api);
const MQTT_BROKER = "mqtt://broker.hivemq.com";  // URL do broker MQTT
const MQTT_TOPIC = "object/movement";  // Tópico MQTT para ouvir

const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('Conectado ao broker MQTT');
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log(`Ouvindo o tópico ${MQTT_TOPIC}`);

    }
  });

});

mqttClient.on('message', (topic, message) => {
  const messageJson = JSON.parse(message.toString());
  console.log(`Mensagem recebida: ${message.toString()}`);
  addMoviment(messageJson);
}
);







try {
  projeto2_db.sync({ force: false, alter: true });
} catch (error) {
  console.info(error);
}







server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
  console.log(
    "Server up and running at http://%s:%s",
    process.env.SERVER_HOST,
    process.env.SERVER_PORT
  );
});

