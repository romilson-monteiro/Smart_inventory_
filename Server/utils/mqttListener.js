import mqtt from 'mqtt';
import dotenv from 'dotenv';
import { ObjectsModel } from '../models/objects.model.js';



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

    const { timestamp, uhftag, room_id } = parsedMessage;

    if (!timestamp || !uhftag || !room_id) {
      console.log('Mensagem JSON faltando campos obrigatórios');
      return;
    }

    console.log(`Mensagem recebida - Timestamp: ${timestamp}, Tag UHF: ${uhftag}, Room ID: ${room_id}`);

    
  }
});
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
