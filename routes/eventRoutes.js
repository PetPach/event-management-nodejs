const express = require('express');
const {
  createNewEvent,
  getAll,
  getById,
  updateOneEvent,
  deleteOneEvent
} = require('../controllers/eventController');

const authMiddleware = require('../middlewares/authMiddleware');
const { validateCreateEvent, validateUpdateEvent, validateEventId } = require('../utils/eventValidator');
const validateResult = require('../utils/handleValidator');

const router = express.Router();

// Ruta para crear un evento (requiere autenticación)
router.post('/', [
  authMiddleware,
  validateCreateEvent,
  validateResult
], createNewEvent);

// Ruta para obtener todos los eventos (requiere autenticación)
router.get('/', authMiddleware, getAll);

// Ruta para obtener un evento por ID
router.get('/:id', [
  authMiddleware,
  validateEventId,
  validateResult
], getById);

// Ruta para actualizar un evento
router.put('/:id', [
  authMiddleware,
  validateUpdateEvent,
  validateResult
], updateOneEvent);

// Ruta para eliminar un evento
router.delete('/:id', [
  authMiddleware,
  validateEventId,
  validateResult
], deleteOneEvent);

module.exports = router;
