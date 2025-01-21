const express = require('express');
const {
  registerUserForEvent,
  cancelRegistration,
  getUserRegistrations,
  getEventRegistrations
} = require('../controllers/registrationController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateEventId = require('../utils/registrationValidator');
const validateResult = require('../utils/handleValidator');

const router = express.Router();

// Ruta para registrar un usuario en un evento
router.post('/:eventId/register', [
  authMiddleware,
  validateEventId,
  validateResult
], registerUserForEvent);

// Ruta para cancelar el registro de un usuario en un evento
router.delete('/:eventId/cancel', [
  authMiddleware,
  validateEventId,
  validateResult
], cancelRegistration);

// Ruta para obtener la lista de registros de un usuario
router.get('/user', authMiddleware, getUserRegistrations);

// Ruta para obtener la lista de inscritos de un evento
router.get('/:eventId/registrations', [
  authMiddleware,
  validateEventId,
  validateResult
], getEventRegistrations);

module.exports = router;
