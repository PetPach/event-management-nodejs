const ddbDocClient = require('../config/dynamoDB');
const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require('@aws-sdk/lib-dynamodb');

const EVENT_TABLE = 'Events';

/**
 * Crear un evento (PutItem)
 */
async function createEvent(eventData) {
  const params = {
    TableName: EVENT_TABLE,
    Item: eventData,
  };
  // Usamos new PutCommand(...)
  await ddbDocClient.send(new PutCommand(params));
  return eventData;
}

/**
 * Obtener un evento por ID (GetItem)
 */
async function getEventById(eventId) {
  const params = {
    TableName: EVENT_TABLE,
    Key: { eventId },
  };
  // Usamos new GetCommand(...)
  const result = await ddbDocClient.send(new GetCommand(params));
  return result.Item || null;
}

/**
 * Actualizar un evento (UpdateItem)
 */
async function updateEvent(eventId, updates) {
  // Ajusta los campos y expresiones según tus atributos
  const params = {
    TableName: EVENT_TABLE,
    Key: { eventId },
    UpdateExpression: `
      SET title = :t,
          description = :desc,
          #dt = :d,
          location = :l,
          type = :ty,
          capacity = :c,
          updatedAt = :ua
    `,
    ExpressionAttributeNames: {
      // "date" puede ser palabra reservada, usamos alias
      '#dt': 'date',
    },
    ExpressionAttributeValues: {
      ':t': updates.title,
      ':desc': updates.description,
      ':d': updates.date,
      ':l': updates.location,
      ':ty': updates.type,
      ':c': updates.capacity,
      ':ua': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };

  // Usamos new UpdateCommand(...)
  const result = await ddbDocClient.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Eliminar un evento (DeleteItem)
 */
async function deleteEvent(eventId) {
  const params = {
    TableName: EVENT_TABLE,
    Key: { eventId },
  };
  // Usamos new DeleteCommand(...)
  await ddbDocClient.send(new DeleteCommand(params));
  return true;
}

/**
 * Obtener todos los eventos (Scan)
 */
async function getAllEvents() {
  const params = {
    TableName: EVENT_TABLE,
  };
  // Usamos new ScanCommand(...)
  const data = await ddbDocClient.send(new ScanCommand(params));
  return data.Items || [];
}

module.exports = {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
};