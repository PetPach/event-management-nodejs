const express = require('express');
const {
  sendRegistrationConfirmation,
  sendEventReminder,
  sendEventUpdate,
  getUserNotifications,
  createCustomNotification
} = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateEventId, validateCustomNotification } = require('../utils/notificationValidator');
const validateResult = require('../utils/handleValidator');

const router = express.Router();

// Ruta para enviar confirmación de registro
router.post('/confirmation/:eventId', [
  authMiddleware,
  validateEventId,
  validateResult
], sendRegistrationConfirmation);

// Ruta para enviar recordatorio de evento
router.post('/reminder/:eventId', [
  authMiddleware,
  validateEventId,
  validateResult
], sendEventReminder);

// Ruta para enviar actualización de evento
router.post('/update/:eventId', [
  authMiddleware,
  validateEventId,
  validateResult
], sendEventUpdate);

// Ruta para obtener notificaciones de un usuario
router.get('/user', authMiddleware, getUserNotifications);

// Ruta para crear una notificación personalizada
router.post('/custom', [
  authMiddleware,
  validateCustomNotification,
  validateResult
], createCustomNotification);

module.exports = router;
