import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { ObjectsModel } from '../models/objects.model.js';
import { addMoviment_CV, addMoviment_uhf } from "../controllers/objects.controller.js";
import { WebSocket } from 'ws';
import { wss } from '../index.js';


// Função para enviar mensagens para todos os clientes conectados
function broadcastMessage(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
            } catch (err) {
                console.error('Erro ao enviar mensagem:', err);
            }
        }
    });
}

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL;

if (!brokerUrl) {
  throw new Error('MQTT_BROKER_URL is not defined in the .env file');
}

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Conectado ao broker MQTT');
  
  // Inscreva-se no tópico onde as tags UHF são publicadas
  client.subscribe('pj2/uhftag', (err) => {
    if (!err) {
      console.log('Inscrito no tópico pj2/uhftag');
    } else {
      console.error('Erro ao se inscrever no tópico:', err);
    }
  });
  // Inscreva-se no tópico onde as tags UHF são publicadas
  client.subscribe('pj2/addTag', (err) => {
    if (err) {
      console.error('Erro ao se inscrever no tópico:', err);
    } else {
      console.log('Inscrito no tópico pj2/addTag');
    }
  });

// inscreva-se no  tópico onde os movimentos detetado pela camera são publicados
  client.subscribe('pj2/CVmoviment', (err) => {
    if (err) {
      console.error('Erro ao se inscrever no tópico:', err);
    } else {
      console.log('Inscrito no tópico pj2/CVmoviment');
    }
  }
  );
});

client.on('message', async (topic, message) => {
  if (topic === 'pj2/uhftag') {
    let parsedMessage;

    try {
      parsedMessage = JSON.parse(message.toString());
    } catch (error) {
      console.log('Mensagem JSON inválida recebida:', error);
      return;
    }

    const { timestamp, uhftag, location_id } = parsedMessage;

    if (!timestamp || !uhftag || !location_id) {
      console.log('Mensagem JSON faltando campos obrigatórios');
      return;
    }

    // Chama a função para enviar a notificação para todos os clientes conectados
    broadcastMessage(parsedMessage);

    
    console.log(`Mensagem recebida - Timestamp: ${timestamp}, Tag UHF: ${uhftag}, Room ID: ${location_id}`);
    addMoviment_uhf(parsedMessage);

    
  } else if (topic === 'pj2/CVmoviment') {
    let messageJson;
    try {
      messageJson = JSON.parse(message.toString());
    } catch (error) {
      console.log('Mensagem JSON inválida recebida:', error);
      return;
    }
    addMoviment_CV(messageJson);
  }

}
);



export function addUHFTag() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      client.removeListener('message', messageHandler);
      reject(new Error('Timeout ao aguardar tag UHF'));
    }, 60000); // Timeout de 1 minuto

    const messageHandler = async (topic, message) => {
      if (topic === 'pj2/addTag') {
        const uhf_Tag = message.toString();
        console.log(`Tag UHF recebida: ${uhf_Tag}`);
        
        try {
          const object = await ObjectsModel.findOne({ where: { uhf_Tag } });

          if (object) {
            console.log(`Objeto encontrado: ${object.name} (ID: ${object.id})`);
          } else {
            console.log('Objeto não encontrado no banco de dados');
            clearTimeout(timeout);
            client.removeListener('message', messageHandler);
            resolve(uhf_Tag);
          }
        } catch (error) {
          console.error('Erro ao consultar o banco de dados:', error);
          clearTimeout(timeout);
          client.removeListener('message', messageHandler);
          reject(error);
        }
      }
    };

    client.on('message', messageHandler);
  });
}
