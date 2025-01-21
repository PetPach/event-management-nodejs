const { matchedData } = require('express-validator');
const { findById, updateUser, deleteUser } = require('../models/userModel');

/**
 * Obtener perfil de usuario
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    // Excluir password
    const { password, ...rest } = user;
    res.json(rest);
  } catch (err) {
    console.error('Error obteniendo perfil de usuario:', err);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Actualizar perfil de usuario
 */
const updateUserProfile = async (req, res) => {
  try {
    const data = matchedData(req);
    const user = await findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const updated = await updateUser(req.user.id, {
      username: data.username || user.username,
      email: data.email || user.email
    });
    // Ocultar password
    const { password, ...rest } = updated;
    res.json(rest);
  } catch (err) {
    console.error('Error actualizando perfil:', err);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Obtener todos los usuarios
 * (En DynamoDB, si no tienes un GSI especial, harías un scan)
 */
const getAllUsers = async (req, res) => {
  try {
    // En un diseño real, es mejor no exponer un "scan" de toda la tabla
    // pero aquí, para ejemplo, podrías usar un scan en la tabla "Users".
    // Creemos una pequeña función local:
    const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const ddbDocClient = require('../config/dynamoDB');

    const scanParams = { TableName: 'Users' }; // Ajusta a tu tabla
    const data = await ddbDocClient.send(new ScanCommand(scanParams));
    const items = data.Items || [];
    // Quitar password
    const safeItems = items.map(({ password, ...rest }) => rest);

    res.json(safeItems);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

/**
 * Eliminar un usuario
 */
const deleteUserCtrl = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    await deleteUser(userId);
    res.json({ msg: 'Usuario eliminado exitosamente' });
  } catch (err) {
    console.error('Error eliminando usuario:', err);
    res.status(500).json({ msg: 'Error en el servidor.' });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  deleteUser: deleteUserCtrl,
};
