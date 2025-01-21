const { matchedData } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const {
  createRegistration,
  findRegistrationByEventAndUser,
  deleteRegistration,
  getRegistrationsByUser,
  getRegistrationsByEvent
} = require('../models/registrationModel');
const { getEventById, updateEvent } = require('../models/eventModel');

/**
 * Registrar a un usuario en un evento
 */
const registerUserForEvent = async (req, res) => {
  try {
    const { eventId } = matchedData(req);
    const userId = req.user.id;

    // Verificar evento
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar si ya está registrado
    const existingRegistration = await findRegistrationByEventAndUser(eventId, userId);
    if (existingRegistration) {
      return res.status(400).json({ msg: 'Ya está registrado en este evento' });
    }

    // Verificar capacidad
    const currentAttendees = event.attendees || [];
    if (currentAttendees.length >= event.capacity) {
      return res.status(400).json({ msg: 'No hay cupos disponibles para este evento' });
    }

    // Crear registro
    const registrationId = uuidv4();
    const regData = {
      registrationId,
      eventId,
      userId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    await createRegistration(regData);

    // Añadir al array de asistentes del evento
    currentAttendees.push(userId);
    await updateEvent(eventId, {
      attendees: currentAttendees,
    });

    res.status(201).json({ msg: 'Registrado en el evento exitosamente', registration: regData });
  } catch (error) {
    console.error('Error registrando al usuario en el evento:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Cancelar registro de un usuario
 */
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = matchedData(req);
    const userId = req.user.id;

    // Verificar si la inscripción existe
    const existingRegistration = await findRegistrationByEventAndUser(eventId, userId);
    if (!existingRegistration) {
      return res.status(404).json({ msg: 'Registro no encontrado' });
    }

    // Verificar evento
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Eliminar la inscripción
    await deleteRegistration(existingRegistration.registrationId);

    // Remover de la lista de asistentes
    const updatedAttendees = (event.attendees || []).filter(att => att !== userId);
    await updateEvent(eventId, { attendees: updatedAttendees });

    res.json({ msg: 'Registro cancelado exitosamente' });
  } catch (error) {
    console.error('Error cancelando el registro:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Obtener la lista de registros de un usuario
 */
const getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const registrations = await getRegistrationsByUser(userId);
    res.json(registrations);
  } catch (error) {
    console.error('Error obteniendo registros del usuario:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Obtener la lista de inscritos de un evento
 */
const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = matchedData(req);
    const event = await getEventById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar permisos
    if (event.organizer !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tiene permisos para ver los registros de este evento' });
    }

    const registrations = await getRegistrationsByEvent(eventId);
    res.json(registrations);
  } catch (error) {
    console.error('Error obteniendo registros del evento:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

module.exports = {
  registerUserForEvent,
  cancelRegistration,
  getUserRegistrations,
  getEventRegistrations,
};
