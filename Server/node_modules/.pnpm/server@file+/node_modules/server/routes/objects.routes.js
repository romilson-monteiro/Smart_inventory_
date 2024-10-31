import { Router } from "express";

import { create, list, createCategory, deleteObject, MovimentsSearch,getMovimentsByObjectId, deleteCategory, getAllCategorys,  getObjectById, updateObject, ObjectSearch, createCategoryGroup, getAllMoviments, getAllCategoryGroups,deleteCategoryGroup,  getCategoryGroupById,updateCategoryGroup ,updateCategory,getCategoryById, 
    readUhfTag
} from "../controllers/objects.controller.js";
import { authRequired } from "../utils/jwt.js";
const objectsRoutes = Router();

//http://localhost:4242/api/objects/create
objectsRoutes.post("/create", authRequired, create);

//http://localhost:4242/api/objects/
objectsRoutes.get("/", authRequired, list);
//http://localhost:4242/api/objects/byid/:id
objectsRoutes.get("/objectbyid/:id", authRequired, getObjectById);


//http://localhost:4242/api/objects/addTag
objectsRoutes.post("/addTag", readUhfTag);

//http://localhost:4242/api/objects/:id
objectsRoutes.put("/:id", authRequired, updateObject);

//http://localhost:4242/api/objects/search/:search
objectsRoutes.get("/search/:search", authRequired, ObjectSearch);



//http://localhost:4242/api/objects/:id
objectsRoutes.delete("/:id", authRequired, deleteObject);


//http://localhost:4242/api/objects/Category/:id
objectsRoutes.delete("/Category/:id", authRequired, deleteCategory);
//http://localhost:4242/api/objects/Category/
objectsRoutes.get("/Category/", authRequired, getAllCategorys);
//http://localhost:4242/api/objects/Category
objectsRoutes.post("/Category", authRequired, createCategory);
//http://localhost:4242/api/objects/Category/:id
objectsRoutes.put("/Category/:id", authRequired, updateCategory);
//http://localhost:4242/api/objects/Category/:id
objectsRoutes.get("/Category/byid/:id", authRequired, getCategoryById);


//http://localhost:4242/api/objects/Category/Group
objectsRoutes.post("/Category/Group", authRequired, createCategoryGroup);
//http://localhost:4242/api/objects/Category/Group
objectsRoutes.get("/Category/Groups", authRequired, getAllCategoryGroups);
//http://localhost:4242/api/objects/Category/Group/:id
objectsRoutes.delete("/Category/Group/:id", authRequired, deleteCategoryGroup);
//http://localhost:4242/api/objects/Category/Group/:id
objectsRoutes.get("/Category/Group/:id", authRequired, getCategoryGroupById);
//http://localhost:4242/api/objects/Category/Group/:id
objectsRoutes.put("/Category/Group/:id", authRequired, updateCategoryGroup);





//http://localhost:4242/api/objects/RegisterMoviment
// objectsRoutes.post("/movements", authRequired, RegisterMoviment);

//http://localhost:4242/api/objects/getAllMoviments
objectsRoutes.get("/movements", authRequired, getAllMoviments);

//http://localhost:4242/api/objects/MovimentsSearch
objectsRoutes.get("/movements/Search/:search", authRequired, MovimentsSearch);

//http://localhost:4242/api/objects/MovimentsByObjectId/:id
objectsRoutes.get("/movements/MovimentsByObjectId/:id", authRequired, getMovimentsByObjectId);



export {objectsRoutes}