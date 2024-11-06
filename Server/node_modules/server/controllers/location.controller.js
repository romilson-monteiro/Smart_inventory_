import { LocationModel } from "../models/location.model.js";
import { UsersModel } from "../models/users.model.js";
import { LogsModel } from "../models/Logs.model.js";



export const create = async (req, res) => {

    try {
        const { floor, name,} = req.body;
        const user_id = req.user.id;
        const description = `${name} - Piso ${floor}`;

        
        const existingLocation = await LocationModel.findOne({ where: { name } });
        if (existingLocation) {
            return res.status(409).json({ message: 'Location already exists' });
        }


        const Location = await LocationModel.create({ floor, name , description });

        const user = await UsersModel.findByPk(user_id);
        await LogsModel.create({ description: `${user.name} (${user.id}) criou a localização ${name} - Piso ${floor}`  , timeStamps: new Date() , event_type: "create" });



        return res.json({
            id: Location.id,
            floor: floor,
            name: Location.name,
            description: Location.description,
        });
    }catch (error) {
        console.error('Error adding Location:', error);
        return res.status(500).json({ message: 'Failed to add Location', error });
    }
}

export const updateLocation = async (req, res) => {
    try {
      const { id } = req.params;
      const { floor, name } = req.body;
      const user_id = req.user.id;

      const Location = await LocationModel.findByPk(id);
      if (!Location) {
        console.error("Location not found with ID:", id);
        return res.status(404).json({ message: "Location not found" });
      }

      const user = await UsersModel.findByPk(user_id);
      if (!user) {
        console.error("User not found with ID:", user_id);
        return res.status(404).json({ message: "User not found" });
      }

      await LogsModel.create({
        description: `${user.name} (${user.id}) atualizou a localização ${Location.name} - Piso ${Location.floor} para ${name} - Piso ${floor}`,
        timeStamps: new Date(),
        event_type: "update"
      });

      Location.floor = floor;
      Location.name = name;
      Location.description = `${name} - Piso ${floor}`;

      await Location.save();

      return res.json({
        id: Location.id,
        floor: Location.floor,
        name: Location.name,
        description: Location.description,
      });
    } catch (error) {
      console.error("Error updating Location:", error);
      return res.status(500).json({ message: "Failed to update Location" });
    }
};




export const getAllLocations = async (req, res) => {
  try {
    const { sortOrder } = req.query;

    // Adicione opções de ordenação piso e em nome
    const order = [['floor', sortOrder || 'ASC'], ['name', sortOrder || 'ASC']];
    const locations = await LocationModel.findAll({
      order: order,
    });

    return res.json(locations);
  }
  catch (error) {
    console.error("Error retrieving locations:", error);
    return res.status(500).json({ message: "Failed to retrieve locations" });
  }
}
  
  export const getLocationsbyId = async (req, res) => {

      try {
        const {id } = req.params;
        const locations = await LocationModel.findByPk(id);

    
        return res.json(locations);
      } catch (error) {
        console.error("Error retrieving locations:", error);
        return res.status(500).json({ message: "Failed to retrieve locations" });
      }
    
    }
  

export const getAllLocationByFloor = async (req, res) => {
  try {
    const { floor } = req.params;
    const locations = await LocationModel.findAll({ where: { floor } });

    return res.json(locations);
  } catch (error) {
    console.error("Error retrieving locations:", error);
    return res.status(500).json({ message: "Failed to retrieve locations" });
  }
}



export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const Location = await LocationModel.findByPk(id);
    if (!Location) {
      return res.status(404).json({ message: "Location not found" });
    }

    const user = await UsersModel.findByPk(user_id);
    await LogsModel.create({ description: `${user.name} (${user.id}) deletou a localização ${Location.name} - Piso ${Location.floor}`  , timeStamps: new Date() , event_type: "delete" });

    await Location.destroy();


  
   

    return res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.error("Error deleting Location:", error);
    return res.status(500).json({ message: "Failed to delete Location" });
  }
};