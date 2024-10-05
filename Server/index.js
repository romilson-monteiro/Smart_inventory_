import mqtt from 'mqtt';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { api } from "./routes/index.js";
import { projeto2_db } from "./config/context/database.js";
import { WebSocketServer } from 'ws';
import http from 'http'; // Importando para criar o servidor HTTP nativo
import './utils/mqttListener.js';

dotenv.config();

const server = express();

const corsOptions = {
  origin: "*", // Para todas as origens. Em produção, especifique as origens confiáveis.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

// Criar um servidor HTTP nativo com o Express
const httpServer = http.createServer(server);

// Agora, o WebSocket Server usa o mesmo servidor HTTP
export const wss = new WebSocketServer({ server: httpServer });

// Quando um cliente se conectar
wss.on('connection', (ws) => {
  console.log('Cliente conectado, total de clientes:', wss.clients.size);

  ws.on('message', (message) => {
    console.log('Mensagem recebida do cliente:', message);
    // Aqui você pode processar a mensagem ou retransmiti-la
  });

  ws.on('close', () => {
    console.log('Cliente desconectado, total de clientes:', wss.clients.size);
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});

// Escutar conexões HTTP e WebSocket na mesma porta
httpServer.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
  console.log(
    "Server up and running at http://%s:%s",
    process.env.SERVER_HOST,
    process.env.SERVER_PORT
  );
});



