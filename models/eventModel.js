const ddbDocClient = require('../config/dynamoDB');
const {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

const EVENT_TABLE = 'Events';

async function createEvent(eventData) {
  const params = {
    TableName: EVENT_TABLE,
    Item: eventData,
  };
  await ddbDocClient.send(new PutCommand(params));
  return eventData;
}

async function getEventById(eventId) {
  const params = {
    TableName: EVENT_TABLE,
    Key: { eventId },
  };
  const result = await ddbDocClient.send(new GetCommand(params));
  return result.Item || null;
}

async function updateEvent(eventId, updates) {
  // Construyes tu UpdateExpression
  // Ejemplo para título, descripción y fecha:
  const params = {
    TableName: EVENT_TABLE,
    Key: { eventId },
    UpdateExpression: 'SET title = :t, description = :d, #dt = :dt',
    ExpressionAttributeNames: {
      '#dt': 'date' // 'date' es palabra reservada en algunos casos
    },
    ExpressionAttributeValues: {
      ':t': updates.title,
      ':d': updates.description,
      ':dt': updates.date
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await ddbDocClient.send(new UpdateCommand(params));
  return result.Attributes;
}

async function deleteEvent(eventId) {
  const params = {
    TableName: EVENT_TABLE,
    Key: { eventId },
  };
  await ddbDocClient.send(new DeleteCommand(params));
  return true;
}

// Ejemplo de listar todos los eventos (cuidado con "scan", en tablas grandes es costoso)
async function getAllEvents() {
  const result = await ddbDocClient.send({ 
    TableName: EVENT_TABLE,
    Command: "Scan"
  });
  return result.Items || [];
}

module.exports = {
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getAllEvents,
};
