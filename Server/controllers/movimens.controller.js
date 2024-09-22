



export const RegisterMoviment = async (req, res) => {

    // {
    //     "class": "object_class",
    //     "confidence": 0.9548329710960388,
    //     "aruco_id": 190,
    //     "box": [
    //         169,
    //         179,
    //         390,
    //         299
    //     ],
    //     "timestamp": "2024-07-07T01:41:48.801907",
    //     "Location_local_id": 1
    // }
    
    try {
        const {  confidence, aruco_id, box, timestamp, Location_local_id, object_class } = req.body;
        const object = await ObjectsModel.findOne({ where: { aruco_id } });
        // verifica se o objeto existe e é object_class
        if (!object || object.class !== object_class) {
            return res.status(404).json({ message: 'Object not found' });
        }


        const location = await LocationModel.findOne({ where: { id: Location_local_id } });
        const last_location = object.location_id;
        const current_location = location.id;
        const description = `Movimentação de ${object.name} de ${last_location} para ${current_location} com confiança de ${confidence}`;
        const timeStamps = timestamp;
        const type = "entrada";
        const moviment = await MovimentsModel.create({
            last_location,
            current_location,
            description,
            timeStamps,
            type,
        });

        await updateObject(object.id, { location_id: current_location, location_last_update: timeStamps }); // Atualiza a localização do objeto
        return res.json({
            id: moviment.id,
            last_location: moviment.last_location,
            current_location: moviment.current_location,
            description: moviment.description,
            timeStamps: moviment.timeStamps,
            type: moviment.type,
        });
    }
    catch (error) {
        console.error('Error adding moviment:', error);
        return res.status(500).json({ message: 'Failed to add moviment', error });
    }
}

