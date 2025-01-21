const { matchedData } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../models/eventModel');

/**
 * Crear un nuevo evento
 */
const createNewEvent = async (req, res) => {
  try {
    const eventData = matchedData(req);
    eventData.eventId = uuidv4(); // Generar ID único con uuid
    eventData.organizer = req.user.id; // el usuario que crea el evento
    eventData.createdAt = new Date().toISOString();
    eventData.updatedAt = new Date().toISOString();

    const newEvent = await createEvent(eventData);
    return res
      .status(201)
      .json({ msg: 'Evento creado exitosamente', event: newEvent });
  } catch (error) {
    console.error('Error creando evento:', error);
    return res
      .status(500)
      .json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
  }
};

/**
 * Obtener todos los eventos
 */
const getAll = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    res
      .status(500)
      .json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
  }
};

/**
 * Obtener un evento por ID
 */
const getById = async (req, res) => {
  try {
    // Usar matchedData si usas express-validator
    const { id } = matchedData(req);
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res
      .status(500)
      .json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
  }
};

/**
 * Actualizar un evento
 */
const updateOneEvent = async (req, res) => {
  try {
    const { id } = req.params; // o matchedData(req)
    const eventData = matchedData(req);

    // Verificar si existe
    let event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar permisos, p.ej. organizer o admin
    if (event.organizer !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        msg: 'No tiene permisos para actualizar este evento',
      });
    }

    // Actualizar
    eventData.updatedAt = new Date().toISOString();
    const updatedEvent = await updateEvent(id, eventData);

    res.json({ msg: 'Evento actualizado', event: updatedEvent });
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res
      .status(500)
      .json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
  }
};

/**
 * Eliminar un evento
 */
const deleteOneEvent = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar permisos
    if (event.organizer !== req.user.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ msg: 'No tiene permisos para eliminar este evento' });
    }

    await deleteEvent(id);
    res.json({ msg: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res
      .status(500)
      .json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
  }
};

module.exports = {
  createNewEvent,
  getAll,
  getById,
  updateOneEvent,
  deleteOneEvent,
};