import { ObjectsModel } from "../models/objects.model.js";
import { CategoryModel } from "../models/Category.model.js";
import { LocationModel } from "../models/location.model.js";
import { CategoryGrupeModel } from "../models/CategoryGrupe.model.js";
import { MovimentsModel } from "../models/moviments.model.js";
import { UsersModel } from "../models/users.model.js";
import { NotificationsModel } from "../models/notification.model.js";
import { addUHFTag } from "../utils/mqttListener.js";
import { WebSocket } from 'ws';
import { wss } from '../index.js';

import { LogsModel } from "../models/Logs.model.js";

import { Op } from "sequelize";
/* Logs LogsModel 
  * id: INTEGER,
  *  user_id: INTEGER,
    *  description: STRING
    * timeStamps: DATE
    */
/**
 * Objects Data to return
 * id: INTEGER,
  * name: STRING,
  * location: STRING (location_name - piso)
  * uhf_tag: STRING,
  * category: STRING (category_name - category_group_name)
  * description: STRING
  * 
 */

/**
 * Moviments history Data
 * id: INTEGER,
 * last_location: INTEGER,
 * current_location: INTEGER,
 * description: STRING
 * timeStamps: DATE  
 * Tipo de movimento (entrada, saída, transferência interna)
 */


export const create = async (req, res) => {

    try {
        const { location_id, category_id, description, name, uhf_tag } = req.body;
        const user_id = req.user.id;



        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para adicionar objeto' });
        }

        const object = await ObjectsModel.create({
            location_id,
            category_id,
            description,
            name,
            uhf_tag,
        });

        await LogsModel.create({  description: `${user.name} (${user.id}) criou o objeto ${object.name} (${object.id})`, timeStamps: new Date(), event_type: "create" });

        return res.json({
            id: object.id,
            location_id: object.location_id,
            category_id: object.category_id,
            description: object.description,
            name: object.name,
            uhf_tag: object.uhf_tag,
        });
    } catch (error) {
        console.error('Error adding object:', error);
        return res.status(500).json({ message: 'Failed to add object', error });
    }
}



export const list = async (req, res) => {

    try {
        const objects = await ObjectsModel.findAll({
            include: [
                { model: LocationModel, as: 'location' },
                { model: CategoryModel, as: 'category' },
            ],
        });





        return res.json(objects);
    } catch (error) {
        console.error('Error listing objects:', error);
        return res.status(500).json({ message: 'Failed to list objects', error });
    }

}

export const deleteObject = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        // Delete the user
        const object = await ObjectsModel.findOne({ where: { id } });
        const user = await UsersModel.findOne({ where: { id: user_id } });
        await LogsModel.create({  description: `${user.name} (${user.id}) deletou o objeto ${object.name} (${object.id})`, timeStamps: new Date(), event_type: "delete" });
        await ObjectsModel.destroy({ where: { id } });



        return res.json({ message: "Object deleted successfully" });
    } catch (error) {
        console.error("Error deleting object:", error);
        return res.status(500).json({ message: "Failed to delete object" });
    }
};



export const readUhfTag = async (req, res) => {
    try {
      const tag = await addUHFTag();
      res.json({ success: true, uhfTag: tag });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }


export const getAllCategoryGroups = async (req, res) => {
    try {
        const CategoryGroups = await CategoryGrupeModel.findAll();
        return res.json(CategoryGroups);
    } catch (error) {
        console.error('Error listing object types:', error);
        return res.status(500).json({ message: 'Failed to list object types', error });
    }
}

export const deleteCategoryGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para deletar grupo de categoria' });
        }

        const categoryGroup = await CategoryGrupeModel.findOne({ where: { id } });
        await LogsModel.create({  description: `${user.name} (${user.id}) deletou o grupo de categoria ${categoryGroup.name} (${categoryGroup.id})`, timeStamps: new Date(), event_type: "delete" });

        await CategoryGrupeModel.destroy({ where: { id } });

        return res.json({ message: "Object type deleted successfully" });
    } catch (error) {
        console.error("Error deleting object type:", error);
        return res.status(500).json({ message: "Failed to delete object type" });
    }
};



export const getCategoryGroupById = async (req, res) => {
    try {
        const { id } = req.params;

        const categoryGroup = await CategoryGrupeModel.findOne({ where: { id } });

        if (!categoryGroup) {
            return res.status(404).json({ message: 'Category Group not found' });
        }

        return res.json(categoryGroup);
    } catch (error) {
        console.error('Error getting object type:', error);
        return res.status(500).json({ message: 'Failed to get object type', error });
    }
}

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await CategoryModel.findOne({ where: { id } },
            {
                include: [
                    { model: CategoryGrupeModel, as: 'categoryGroup' },
                ],
            }
        );


        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.json(category);
    } catch (error) {
        console.error('Error getting object type:', error);
        return res.status(500).json({ message: 'Failed to get object type', error });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { name, CategoryGrupe_id } = req.body;

        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para atualizar categoria' });
        }

        const category = await CategoryModel.findOne({ where: { id } });

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const categoryGroup = await CategoryGrupeModel.findOne({ where: { id: CategoryGrupe_id } });
        if (!categoryGroup) {
            return res.status(404).json({ message: 'Category Group not found' });
        }

        await LogsModel.create({ description: `${user.name} (${user.id}) atualizou a categoria ${category.name} (${category.id}) para ${name}`, timeStamps: new Date(), event_type: "update" });

        category.name = name;
        category.CategoryGrupe_id = CategoryGrupe_id;
        category.description = `${name} - ${categoryGroup.name}`;

        await category.save();

        return res.json({
            id: category.id,
            name: category.name,
            CategoryGrupe_id: category.CategoryGrupe_id,
            description: category.description,
        });

    } catch (error) {
        console.error('Error updating object type:', error);
        return res.status(500).json({ message: 'Failed to update object type', error });
    }
}

export const updateCategoryGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { name } = req.body;

        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para atualizar grupo de categoria' });
        }

        const categoryGroup = await CategoryGrupeModel.findOne({ where: { id } });

        if (!categoryGroup) {
            return res.status(404).json({ message: 'Category Group not found' });
        }

        await LogsModel.create({ description: `${user.name} (${user.id}) atualizou o grupo de categoria ${categoryGroup.name} (${categoryGroup.id}) para ${name}`, timeStamps: new Date(), event_type: "update" });

        categoryGroup.name = name;

        await categoryGroup.save();

        return res.json({
            id: categoryGroup.id,
            name: categoryGroup.name,
        });

    } catch (error) {
        console.error('Error updating object type:', error);
        return res.status(500).json({ message: 'Failed to update object type', error });
    }
}















export const createCategoryGroup = async (req, res) => {

    try {
        const { name } = req.body;
        const user_id = req.user.id;
        const existingCategoryGroup = await CategoryGrupeModel.findOne({ where: { name } });
        if (existingCategoryGroup) {
            return res.status(400).json({ message: 'Category Group already exists' });
        }

        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para criar grupo de categoria' });
        }

        await LogsModel.create({ description: `${user.name} (${user.id}) criou o grupo de categoria ${name}`, timeStamps: new Date(), event_type: "create" });




        const categoryGroup = await CategoryGrupeModel.create({
            name,
        });

        return res.json({
            id: categoryGroup.id,
            name: categoryGroup.name,
        });
    } catch (error) {
        console.error('Error adding object type:', error);
        return res.status(500).json({ message: 'Failed to add object type', error });
    }
}

export const createCategory = async (req, res) => {

    try {
        const { name, CategoryGrupe_id } = req.body;
        const user_id = req.user.id;
        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para atualizar objeto' });
        }

        const existingCategory = await CategoryModel.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Create a description name + category group name (consultar)

        const categoryGroup = await CategoryGrupeModel.findOne({ where: { id: CategoryGrupe_id } });
        if (!categoryGroup) {
            return res.status(404).json({ message: 'Category Group not found' });
        }



        const description = `${name} - ${categoryGroup.name}`;


        const category = await CategoryModel.create({
            name,
            CategoryGrupe_id,
            description,
        });



        await LogsModel.create({ description: `${user.name} (${user.id}) criou a categoria ${name}`, timeStamps: new Date(), event_type: "create" });



        return res.json({
            id: category.id,
            name: category.name,
            CategoryGrupe_id: category.CategoryGrupe_id,
            description: category.description,
        });

    } catch (error) {
        console.error('Error adding object type:', error);
        return res.status(500).json({ message: 'Failed to add object type', error });
    }
}


export const getObjectById = async (req, res) => {
    try {
        const { id } = req.params;

        const object = await ObjectsModel.findOne({
            where: { id },
            include: [
                { model: LocationModel, as: 'location' },
                { model: CategoryModel, as: 'category' },
            ],
        });

        if (!object) {
            return res.status(404).json({ message: 'Object not found' });
        }

        return res.json(object);
    } catch (error) {
        console.error('Error getting object:', error);
        return res.status(500).json({ message: 'Failed to get object', error });
    }
}

export const updateObject = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const { location_id, category_id, description, name, uhf_tag } = req.body;

        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para atualizar objeto' });
        }

        const object = await ObjectsModel.findOne({ where: { id } });

        if (!object) {
            return res.status(404).json({ message: 'Object not found' });
        }


        await LogsModel.create({ description: `${user.name} (${user.id}) atualizou o objeto ${object.name} (${object.id}) para ${name} (${id})`, timeStamps: new Date(), event_type: "update" });

        object.location_id = location_id;
        object.category_id = category_id;
        object.description = description;
        object.name = name;
        object.uhf_tag = uhf_tag;

        await object.save();





        return res.json({
            id: object.id,
            category_id: object.category_id,
            description: object.description,
        });
    }
    catch (error) {
        console.error('Error updating object:', error);
        return res.status(500).json({ message: 'Failed to update object', error });
    }

}



export const getAllCategorys = async (req, res) => {
    try {
        const Categorys = await CategoryModel.findAll(
            {
                include: [
                    { model: CategoryGrupeModel, as: 'categoryGroup' },
                ],
            }
        );


        return res.json(Categorys);
    } catch (error) {
        console.error('Error listing object types:', error);
        return res.status(500).json({ message: 'Failed to list object types', error });
    }
}


export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const user = await UsersModel.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ message: 'Sem permissão para deletar categoria' });
        }

        const category = await CategoryModel.findOne({ where: { id } });
        await LogsModel.create({ description: `${user.name} (${user.id}) deletou a categoria ${category.name} (${category.id})`, timeStamps: new Date(), event_type: "delete" });

        await CategoryModel.destroy({ where: { id } });

        return res.json({ message: "Object type deleted successfully" });
    } catch (error) {
        console.error("Error deleting object type:", error);
        return res.status(500).json({ message: "Failed to delete object type" });
    }
};





export const ObjectSearch = async (req, res) => {
    try {
        const { search } = req.params;

        const objects = await ObjectsModel.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { uhf_tag: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                ]
            },
            include: [
                { model: LocationModel, as: 'location' },
                { model: CategoryModel, as: 'category' },
            ],
        });


        return res.json(objects);
    } catch (error) {
        console.error('Error searching objects:', error);
        return res.status(500).json({ message: 'Failed to search objects', error });
    }
}

export const MovimentsSearch = async (req, res) => {
    try {
        const { search } = req.params;

        // incluir moviment e acett na resposta
        const moviments = await MovimentsModel.findAll({
            where: {
                [Op.or]: [
                    { description: { [Op.like]: `%${search}%` } },
                ]
            },
            include: [
                { model: ObjectsModel, as: 'asset' },
                { model: LocationModel, as: 'lastLocation' },
                { model: LocationModel, as: 'currentLocation' },
            ],
        });


        return res.json(moviments);
    } catch (error) {
        console.error('Error searching moviments:', error);
        return res.status(500).json({ message: 'Failed to search moviments', error });
    }
}



// // Deteção UHF
// {
// 	"detection_type": "UHF",
// 	"timestamp" : "21-05-2024:11:13",
// 	"uhftag" : "38985398893ujfrfo3"
// 	"location_id" : "1"
// }

// // Deteção CV
// {
// 	"detection_type": "CV"
// 	"object_class": "1",
// 	"confidence": "0-100%",
// 	"aruco_id": "1",
// 	"timestamp": "21-05-2024:11:13",
// 	"location_id" : "1"
// }

export async function addMoviment_uhf(data) {
    try {
        if (!data) {
            throw new Error("No data provided");
        }

        const { uhftag, location_id, timestamp } = data;
        
        if (uhftag === undefined || location_id === undefined || timestamp === undefined) {
            throw new Error("Missing required fields in data");
        }

        const object = await ObjectsModel.findOne({ where: { uhf_tag: uhftag } });
        if (!object) {
            console.log("object not found ");
            return;
        }

        const location = await LocationModel.findOne({ where: { id: location_id } });
        

        const last_location = await LocationModel.findOne({ where: { id: object.location_id } });
        const current_location = await LocationModel.findOne({ where: { id: location.id } });
       


        // Atualiza a localização do objeto

        // verificar se a localização é a mesma , se for não registra o movimento e atualizar no objecto apenas location_last_update: timeStamps

        if (last_location.id === current_location.id) {
            console.log("object in the same location");
            await ObjectsModel.update({ location_last_update: timestamp }, { where: { uhf_tag: uhftag } });
            return;
        }

        const description = `Movimentação de ${object.name} de ${last_location.name} para ${current_location.name}`;
        const timeStamps = timestamp;
       
        const type = "entrada";
        const moviment = await MovimentsModel.create({
            asset_id: object.id,
            last_location,
            current_location,
            description,
            timeStamps,
            type: "UHF",
        });

       

        await ObjectsModel.update({ location_id: current_location.id, location_last_update: timeStamps }, { where: { uhf_tag: uhftag } });

        await LogsModel.create({ description: `Movimentação de ${object.name} de ${last_location.name} para ${current_location.name}`, timeStamps: new Date(), event_type: "moviment" });

        console.log("Movimentação de ", object.name, " de ", last_location.name, " para ", current_location.name);
        const moviments_return = {
            id: moviment.id,
            asset: object.name,
            previousLocation: last_location.name,
            currentLocation: current_location.name,
            timestamp: moviment.timeStamps,
        };
        
        broadcastMessage(moviments_return);
        return {
            id: moviment.id,
            asset: object.name,
            previousLocation: last_location.name,
            currentLocation: current_location.name,
            timestamp: moviment.timeStamps,
        };




    } catch (error) {
        console.error('Error adding moviment:', error);
        return { message: 'Failed to add moviment', error };
    }
}



export async function addMoviment_CV(data) {
    try {
        if (!data) {
            throw new Error("No data provided");
        }

        
        

        const { aruco_id, object_class, location_id, confidence, box } = data;
        const timestamp = new Date();

        if (aruco_id === undefined || object_class === undefined || location_id === undefined || confidence === undefined || box === undefined) {
            throw new Error("Missing required fields in data");

        }

        if ( object_class == "pessoa" ) {
            return;
        /* } else if (aruco_id > 900 && object_class === "pessoa") {
            const userId = aruco_id - 900;
            const user = await UsersModel.findOne({ where: {  id: userId } });
            if (!user) {
                console.log("user not found ");
                return;
            }

            const location = await LocationModel.findOne({ where: { id: location_id } });

            
            const last_location = user.location_id;
            const current_location = location.id;

            // Atualiza a localização do objeto

            // verificar se a localização é a mesma , se for não registra o movimento e atualizar no objecto apenas location_last_update: timeStamps



            if (last_location === current_location) {
                console.log("user in the same location");
                await UsersModel.update({ location_id: current_location, location_last_update: timestamp }, { where: { id: aruco_id } });
                return;

            }

            const description = `Movimentação de ${user.name} de ${last_location} para ${current_location} com confiança de ${confidence}`;
            const timeStamps = timestamp;
            const type = "entrada";
            const moviment = await MovimentsModel.create({
                asset_id: aruco_id,
                last_location,
                current_location,
                description,
                timeStamps,
                type,
            });

            console.log("Movimentação de ", user.name, " de ", last_location, " para ", current_location, " com confiança de ", confidence);
            await UsersModel.update({ location_id: current_location, location_last_update: timeStamps }, { where: { id: aruco_id } });
            await LogsModel.create({ description: ` ${user.name} movimentou de ${last_location} para ${current_location}`, timeStamps: new Date(), event_type: "moviment" });

            return {
                id: moviment.id,
                last_location: moviment.last_location,
                current_location: moviment.current_location,
                description: moviment.description,
                timeStamps: moviment.timeStamps,
                type: moviment.type,
            };
 */

        } else {
            const object = await ObjectsModel.findOne({ where: { id: aruco_id } });
            // verifica se o objeto existe e é object_class
            if (!object) {
                console.log("object not found ");
                return;

            }


            const objectCategory = await CategoryModel.findOne({ where: { id: object.category_id } });

            if (objectCategory.name !== object_class) {
                console.log("object not found in this category : ", objectCategory.name, object_class);
                return;

            }



            const current_location = await LocationModel.findOne({ where: { id: location_id } });
            const last_location = await LocationModel.findOne({ where: { id: object.location_id } });
           
            // Atualiza a localização do objeto


            // verificar se a localização é a mesma , se for não registra o movimento e atualizar no objecto apenas location_last_update: timeStamps


            if (last_location.id === current_location.id) {
                console.log("object in the same location");
                await ObjectsModel.update({ location_last_update: timestamp }, { where: { id: aruco_id } });
                return;
            }

            const description = `Movimentação de ${object.name} de ${last_location.name} para ${current_location.name} com confiança de ${confidence}`;
            const timeStamps = timestamp;
            const type = "entrada";
            const moviment = await MovimentsModel.create({
                asset_id: object.id,
                last_location: last_location.id,
                current_location: current_location.id,
                description,
                timeStamps,
                type,
            });

            console.log("Movimentação de ", object.name, " de ", last_location.name, " para ", current_location.name, " com confiança de ", confidence);
            await ObjectsModel.update({ location_id: current_location.id, location_last_update: timeStamps }, { where: { id: aruco_id } });
            await LogsModel.create({ description: `Movimentação de ${object.name} de ${last_location.name} para ${current_location.name}`, timeStamps: new Date(), event_type: "moviment" });

            const moviments_return = {
             
                asset: object.name,
                previousLocation: last_location.name,
                currentLocation: current_location.name,
                timestamp: moviment.timeStamps,
            };
            broadcastMessage(moviments_return);
            return {
                id: moviment.id,
                asset: object.name,
                previousLocation: last_location.name,
                currentLocation: current_location.name,
                timestamp: moviment.timeStamps,
            };
        }
    }
    catch (error) {
        console.error('Error adding moviment:', error);
        return { message: 'Failed to add moviment', error };
    }
}



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

export const getMovimentsByObjectId = async (req, res) => {
    try {
        const { id } = req.params;

        // order by timestamps  por time stamps  os mais recentes primeiro
        const moviments = await MovimentsModel.findAll({
            where: { asset_id: id },
            include: [
                { model: ObjectsModel, as: 'asset' },
                { model: LocationModel, as: 'lastLocation' },
                { model: LocationModel, as: 'currentLocation' },
            ],
            order: [['timeStamps', 'DESC']],
        });

        


       

        return res.json(moviments);
    } catch (error) {
        console.error('Error getting moviments:', error);
        return res.status(500).json({ message: 'Failed to get moviments', error });
    }
}

export const getAllMoviments = async (req, res) => {
    try {
        
        const moviments =
            await MovimentsModel.findAll({

                include: [
                    { model: ObjectsModel, as: 'asset' },
                    { model: LocationModel, as: 'lastLocation' },
                    { model: LocationModel, as: 'currentLocation' },
                ],
            });
        return res.json(moviments);
    } catch (error) {
        console.error('Error listing moviments:', error);
        return res.status(500).json({ message: 'Failed to list moviments', error });
    }
}




// Controller for Complete Inventory Report
export const getCompleteInventoryReport = async (req, res) => {
    try {
        // Fetch all assets along with their current location data
        const assets = await ObjectsModel.findAll({
            attributes: ['id', 'name', 'uhf_tag', 'description'],
            include: [
                {
                    model: LocationModel,
                    as: 'location',
                    attributes: ['name', 'floor'],
                },
                {
                    model: CategoryModel,
                    as: 'category',
                    attributes: ['name', 'description'],
                },
            ],
            order: [['name', 'ASC']],
        });

        return res.json(assets);

    } catch (error) {
        console.error('Error generating complete inventory report:', error);
        return res.status(500).json({ message: 'Failed to generate complete inventory report', error });
    }
};

      

// Controller for Assets by Room
export const getAssetsByRoomReport = async (req, res) => {
    try {
        // Fetch all assets along with their current location data
        const assets = await ObjectsModel.findAll({
            attributes: ['id', 'name', 'uhf_tag', 'description'],
            include: [
                {
                    model: LocationModel,
                    as: 'location',
                    attributes: ['name', 'floor'],
                },
                {
                    model: CategoryModel,
                    as: 'category',
                    attributes: ['name', 'description'],
                },
            ],
            order: [[{ model: LocationModel, as: 'location' }, 'name', 'ASC']],
        });

        // Group assets by location
        const groupedAssets = assets.reduce((acc, asset) => {
            const locationKey = `${asset.location.name} - Piso ${asset.location.floor}`;
            if (!acc[locationKey]) acc[locationKey] = [];
            
            acc[locationKey].push({
                id: asset.id,
                name: asset.name,
                uhf_tag: asset.uhf_tag,
                category: `${asset.category.description}`,
                description: asset.description,
            });

            return acc;
        }, {});

        return res.json(groupedAssets);
    } catch (error) {
        console.error('Error generating assets by room report:', error);
        return res.status(500).json({ message: 'Failed to generate assets by room report', error });
    }
};
