const ddbDocClient = require('../config/dynamoDB');
const {
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb');

const NOTIF_TABLE = 'Notifications';

// Crea una notificación
async function createNotification(notificationData) {
  const params = {
    TableName: NOTIF_TABLE,
    Item: notificationData,
  };
  await ddbDocClient.send(new PutCommand(params));
  return notificationData;
}

// Obtener una notificación por su ID
// (asumiendo que la pk es notificationId)
async function getNotificationById(notificationId) {
  const params = {
    TableName: NOTIF_TABLE,
    Key: { notificationId },
  };
  const data = await ddbDocClient.send(new GetCommand(params));
  return data.Item || null;
}

// Listar notificaciones de un usuario (se requiere un índice o partición por userId)
async function getNotificationsByUserId(userId) {  
  const scanParams = {
    TableName: NOTIF_TABLE,
    FilterExpression: 'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  };
  const data = await ddbDocClient.send(new ScanCommand(scanParams));
  return data.Items || [];
}

async function deleteNotification(notificationId) {
  const params = {
    TableName: NOTIF_TABLE,
    Key: { notificationId },
  };
  await ddbDocClient.send(new DeleteCommand(params));
  return true;
}

module.exports = {
  createNotification,
  getNotificationById,
  getNotificationsByUserId,
  deleteNotification,
};
