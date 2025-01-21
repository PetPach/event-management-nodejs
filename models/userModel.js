const ddbDocClient = require('../config/dynamoDB');
const {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

// Nombre de la tabla de usuarios en DynamoDB
const USER_TABLE = 'Users'; // Ajusta este nombre a tu tabla real

/**
 * Busca un usuario por email (requiere un GSI en la tabla para email).
 */
async function findByEmail(email) {
  // Debes haber configurado un Global Secondary Index
  // con 'email' como clave de partición, e.g. "EmailIndex".
  const params = {
    TableName: USER_TABLE,
    IndexName: 'EmailIndex', // Nombre de tu índice
    KeyConditionExpression: 'email = :e',
    ExpressionAttributeValues: {
      ':e': email
    }
  };

  const result = await ddbDocClient.send(new QueryCommand(params));
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

/**
 * Busca un usuario por ID (clave primaria userId).
 */
async function findById(userId) {
  const params = {
    TableName: USER_TABLE,
    Key: { userId }
  };
  const result = await ddbDocClient.send(new GetCommand(params));
  return result.Item || null;
}

/**
 * Crea un nuevo usuario en la tabla.
 * @param {Object} userData
 */
async function createUser(userData) {
  // userData debe incluir userId único (por ejemplo con uuid)
  const params = {
    TableName: USER_TABLE,
    Item: userData
  };
  await ddbDocClient.send(new PutCommand(params));
  return userData;
}

/**
 * Actualiza un usuario por ID.
 * @param {String} userId
 * @param {Object} updates
 */
async function updateUser(userId, updates) {
  // Debes generar UpdateExpression y ExpressionAttributeValues.
  // Ejemplo simplificado para username y email:
  const params = {
    TableName: USER_TABLE,
    Key: { userId },
    UpdateExpression: 'SET username = :u, email = :e',
    ExpressionAttributeValues: {
      ':u': updates.username,
      ':e': updates.email
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await ddbDocClient.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Elimina un usuario por ID.
 */
async function deleteUser(userId) {
  const params = {
    TableName: USER_TABLE,
    Key: { userId }
  };
  await ddbDocClient.send(new DeleteCommand(params));
  return true;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser,
  deleteUser
};
