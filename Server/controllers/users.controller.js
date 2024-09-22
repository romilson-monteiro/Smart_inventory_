import { UsersModel } from "../models/users.model.js";
import { LogsModel } from "../models/Logs.model.js";
import { LocationModel } from "../models/location.model.js";
import { Op } from "sequelize";

import { createToken } from "../utils/jwt.js";
import { encrypt, compareHashes} from "../utils/crypto.js"

import path from 'path';
// import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';


export const register = async (req, res) => {

  try {
    const { name, email, phone, role, password } = req.body;
    // const user_id = req.user.id;

    // const userAdmin = await UsersModel.findByPk(user_id);

    // if (!userAdmin) {
    //   return res.status(404).json({ message: "Permission denied" });
    // }
    //    const description = `${userAdmin.name} (${userAdmin.id}) criou o Utilizador ${name} (${email})`;



   
    // Verificar se o email já está em uso
    const existingUser = await UsersModel.findOne({ where: { email } });

      const  username = email.split('@')[0].replace(/\./g, '_').toLowerCase();
    
            
  
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = encrypt(password);
   

    const user = await UsersModel.create({
      name,    
      email,
      phone,
      username,
      role,
      password: hashedPassword,
    });

    const aruco_id = 900 + user.id;

    user.aruco_id = aruco_id;
    await user.save();

   // LogsModel.create({ description , timeStamps: new Date() , event_type: "create" });



// return just user info esclude password
    return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,  
        username: user.username,
        aruco_id: user.aruco_id, 
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Failed to create user', error });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = encrypt(password);
 
  
  const user = await UsersModel.findOne({ where: { email } });

  

  if (!user) {
    return res.status(401).json({ message: 'User not found' });
  }

  
  const passwordMatch = compareHashes(hashedPassword, user.password)

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  LogsModel.create({  description: `User ${user.name} (${user.id}) logged in` , timeStamps: new Date() , event_type: "login" });
  const token = createToken({
    id: user.id,
    email: user.email,
    batatas: 2,
  });

  //excluir password do user
  user.password = undefined;
  return res.json({ user, token });
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    // Delete the user
    await UsersModel.destroy({ where: { id } });

    // Log the event
    const user = await UsersModel.findByPk(user_id);
    await LogsModel.create({ description: `${user.name} (${user.id}) deletou o Utilizador ${id}` , timeStamps: new Date() , event_type: "delete" });
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { sortOrder } = req.query;

    // Adicione opções de ordenação, incluir location na res
    const order = [['name', sortOrder || 'ASC']]; 

    const users = await UsersModel.findAll({
      order: order,
      attributes: { exclude: ["password"] },
      include: [{ model: LocationModel, as: 'location' }],
    });



    return res.json(users);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({ message: "Failed to retrieve users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UsersModel.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [{ model: LocationModel, as: 'location' }],
    });
    

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({ message: "Failed to retrieve user" });
  }
}

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, username, role } = req.body;
    const user_id = req.user.id;

    const user = await UsersModel.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.username = username;
    user.role = role;

    await user.save();

    const userAdmin = await UsersModel.findByPk(user_id);

    LogsModel.create({ description: `${userAdmin.name} (${userAdmin.id}) atualizou o Utilizador ${user.name} (${user.id})` , timeStamps: new Date() , event_type: "update" });

    return res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Failed to update user" });
  }
}



const createResetToken = (userId) => {
  return jwt.sign({ userId }, '2222', { expiresIn: '1h' });
};


export const searchUser = async (req, res) => {
  try {
    const { search } = req.params;

    const users = await UsersModel.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
        ],
      },
      attributes: { exclude: ["password"] },
    },
    { include: [{ model: LocationModel, as: 'location' }] });

    return res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ message: "Failed to search users" });
  }
};


