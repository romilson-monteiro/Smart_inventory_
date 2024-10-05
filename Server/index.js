import mqtt from 'mqtt';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { api } from "./routes/index.js";
import { projeto2_db } from "./config/context/database.js";
import './utils/mqttListener.js';


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

