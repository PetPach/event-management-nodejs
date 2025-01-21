const ddbDocClient = require('../config/dynamoDB');
const {
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb');

const REG_TABLE = 'Registrations';

// Crea un registro de inscripción
async function createRegistration(regData) {
  const params = {
    TableName: REG_TABLE,
    Item: regData,
  };
  await ddbDocClient.send(new PutCommand(params));
  return regData;
}

// Obtiene un registro (asumiendo pk = registrationId)
async function getRegistrationById(registrationId) {
  const params = {
    TableName: REG_TABLE,
    Key: { registrationId },
  };
  const data = await ddbDocClient.send(new GetCommand(params));
  return data.Item || null;
}

// Busca un registro por eventId y userId
async function findRegistrationByEventAndUser(eventId, userId) {
  const params = {
    TableName: REG_TABLE,
    FilterExpression: 'eventId = :eid AND userId = :uid',
    ExpressionAttributeValues: {
      ':eid': eventId,
      ':uid': userId,
    },
  };
  const data = await ddbDocClient.send(new ScanCommand(params));
  if (data.Items && data.Items.length > 0) {
    return data.Items[0];
  }
  return null;
}

async function deleteRegistration(registrationId) {
  const params = {
    TableName: REG_TABLE,
    Key: { registrationId },
  };
  await ddbDocClient.send(new DeleteCommand(params));
  return true;
}

// Obtener todas las inscripciones de un usuario
async function getRegistrationsByUser(userId) {
  // Ejemplo con Scan (mejor usar GSI o PK = userId).
  const params = {
    TableName: REG_TABLE,
    FilterExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': userId,
    },
  };
  const data = await ddbDocClient.send(new ScanCommand(params));
  return data.Items || [];
}

// Obtener todas las inscripciones de un evento
async function getRegistrationsByEvent(eventId) {
  const params = {
    TableName: REG_TABLE,
    FilterExpression: 'eventId = :eid',
    ExpressionAttributeValues: {
      ':eid': eventId,
    },
  };
  const data = await ddbDocClient.send(new ScanCommand(params));
  return data.Items || [];
}

/**
 * Actualizar un registro (ej: cambiar status).
 */
async function updateRegistration(registrationId, status) {
  const params = {
    TableName: REG_TABLE,
    Key: { registrationId },
    UpdateExpression: 'SET #st = :s, updatedAt = :ua',
    ExpressionAttributeNames: {
      '#st': 'status',
    },
    ExpressionAttributeValues: {
      ':s': status,
      ':ua': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };
  const result = await ddbDocClient.send(new UpdateCommand(params));
  return result.Attributes;
}

module.exports = {
  createRegistration,
  getRegistrationById,
  findRegistrationByEventAndUser,
  deleteRegistration,
  getRegistrationsByUser,
  getRegistrationsByEvent,
  updateRegistration,
};
