const { matchedData } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
} = require('../models/eventModel');

/**
 * Crear un nuevo evento
 */
const createNewEvent = async (req, res) => {
  try {
    const eventData = matchedData(req);
    const eventId = uuidv4();
    // Agregamos el userId del organizador y la fecha actual:
    eventData.eventId = eventId;
    eventData.organizerId = req.user.id;
    eventData.createdAt = new Date().toISOString();

    const newEvent = await createEvent(eventData);

    res.status(201).json({
      msg: 'Evento creado exitosamente',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creando evento:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
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
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Obtener un evento por ID
 */
const getById = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error obteniendo evento:', error);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

/**
 * Actualizar un evento
 */
const updateOneEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = matchedData(req);

    // Verificar que exista
    let event = await getEventById(id);
    if (!event) {
      return res.status(404).json({ msg: 'Evento no encontrado' });
    }

    // Verificar permisos
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tiene permisos para actualizar este evento' });
    }

    // Actualizar
    const updated = await updateEvent(id, eventData);
    res.json({ msg: 'Evento actualizado', event: updated });
  } catch (error) {
    console.error('Error actualizando evento:', error);
    res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
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
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'No tiene permisos para eliminar este evento' });
    }

    await deleteEvent(id);
    res.json({ msg: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando evento:', error);
    res.status(500).json({ msg: 'Error en el servidor, intente nuevamente más tarde.' });
  }
};

module.exports = {
  createNewEvent,
  getAll,
  getById,
  updateOneEvent,
  deleteOneEvent,
};
