const express = require('express');
const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { validateUpdateUserProfile } = require('../utils/authValidator');
const validateResult = require('../utils/handleValidator');

const router = express.Router();

// Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, getUserProfile);

// Actualizar perfil del usuario autenticado
router.put('/profile', [
  authMiddleware,
  validateUpdateUserProfile,
  validateResult
], updateUserProfile);

// Obtener todos los usuarios (solo admin)
router.get('/', [authMiddleware, roleMiddleware(['admin'])], getAllUsers);

// Eliminar usuario (solo admin)
router.delete('/:id', [
  authMiddleware,
  roleMiddleware(['admin'])
], deleteUser);

module.exports = router;
