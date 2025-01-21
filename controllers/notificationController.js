const { matchedData } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const {
  createNotification,
  getNotificationsByUserId
} = require('../models/notificationModel');
const { findById: findUserById } = require('../models/userModel');
const { getEventById } = require('../models/eventModel');
const emailService = require('../services/emailService');

/**
 * Enviar notificación de confirmación de registro
 */
const sendRegistrationConfirmation = async (req, res) => {
  try {
    const { eventId } = matchedData(req);
    const userId = req.user.id;

    const user = await findUserById(userId);
    const event = await getEventById(eventId);
    if (!user || !event) {
      return res.status(404).json({ msg: 'Usuario o evento no encontrado' });
    }

    // Crear notificación
    const notifId = uuidv4();
    const notificationData = {
      notificationId: notifId,
      userId,
      eventId,
      type: 'confirmation',
      message: `Confirmación de registro para el evento ${event.title}`,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };
    await createNotification(notificationData);

    // Enviar correo
    await emailService.sendEmail({
      to: user.email,
      subject: `Confirmación de registro para el evento ${event.title}`,
      text: `Has sido registrado exitosamente para el evento ${event.title}...`
    });

    res.status(200).json({
      msg: 'Correo de confirmación enviado y notificación registrada.'
    });
  } catch (error) {
    console.error('Error enviando confirmación de registro:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Enviar recordatorio de evento
 */
const sendEventReminder = async (req, res) => {
  try {
    const { eventId } = matchedData(req);
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Supongamos que event.attendees es un array con IDs de usuarios
    if (!event.attendees || !Array.isArray(event.attendees)) {
      return res.status(400).json({ msg: 'No hay asistentes para este evento' });
    }

    for (const attendeeId of event.attendees) {
      const user = await findUserById(attendeeId);
      if (!user) continue;

      // Crear notificación
      const notifId = uuidv4();
      const notificationData = {
        notificationId: notifId,
        userId: attendeeId,
        eventId: event.eventId,
        type: 'reminder',
        message: `Recordatorio del evento ${event.title}`,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
      };
      await createNotification(notificationData);

      // Enviar email
      await emailService.sendEmail({
        to: user.email,
        subject: `Recordatorio del evento ${event.title}`,
        text: `Este es un recordatorio para el evento ${event.title}...`
      });
    }

    res.status(200).json({ msg: 'Recordatorios enviados y notificaciones registradas.' });
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Enviar notificación de actualización de evento
 */
const sendEventUpdate = async (req, res) => {
  try {
    const { eventId } = matchedData(req);
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    if (!event.attendees || !Array.isArray(event.attendees)) {
      return res.status(400).json({ msg: 'No hay asistentes para este evento' });
    }

    for (const attendeeId of event.attendees) {
      const user = await findUserById(attendeeId);
      if (!user) continue;

      // Crear notificación
      const notifId = uuidv4();
      const notificationData = {
        notificationId: notifId,
        userId: attendeeId,
        eventId: event.eventId,
        type: 'update',
        message: `Actualización del evento ${event.title}`,
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
      };
      await createNotification(notificationData);

      // Enviar email
      await emailService.sendEmail({
        to: user.email,
        subject: `Actualización del evento ${event.title}`,
        text: `El evento ${event.title} ha sido actualizado...`
      });
    }

    res.status(200).json({ msg: 'Actualizaciones enviadas y notificaciones registradas.' });
  } catch (error) {
    console.error('Error enviando actualización de evento:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Obtener notificaciones de un usuario
 */
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await require('../models/notificationModel')
      .getNotificationsByUserId(userId);

    res.json(notifications);
  } catch (error) {
    console.error('Error obteniendo notificaciones del usuario:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Crear notificación personalizada (para admin)
 */
const createCustomNotification = async (req, res) => {
  try {
    const { userId, message } = matchedData(req);
    const adminId = req.user.id;

    // Verificar rol admin
    const adminUser = await require('../models/userModel').findById(adminId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ msg: 'No tiene permisos para enviar notificaciones personalizadas' });
    }

    // Crear notificación sin eventId
    const notifId = uuidv4();
    const notificationData = {
      notificationId: notifId,
      userId,
      type: 'custom',
      message,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
    };
    await createNotification(notificationData);

    // Obtener email del destinatario
    const targetUser = await require('../models/userModel').findById(userId);
    if (!targetUser) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Enviar correo
    await emailService.sendEmail({
      to: targetUser.email,
      subject: 'Notificación personalizada',
      text: message
    });

    res.status(200).json({ msg: 'Notificación personalizada enviada y registrada.' });
  } catch (error) {
    console.error('Error enviando notificación personalizada:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

module.exports = {
  sendRegistrationConfirmation,
  sendEventReminder,
  sendEventUpdate,
  getUserNotifications,
  createCustomNotification,
};
