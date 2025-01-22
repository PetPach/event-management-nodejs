const { check, param } = require('express-validator');

const validateEventId = [
    param('eventId').optional().isUUID().withMessage('ID de evento inválido')
];

const validateCustomNotification = [
    param('userId').isUUID().withMessage('ID de usuario inválido'),
    check('message').notEmpty().withMessage('El mensaje no puede estar vacío')
];

module.exports = {
    validateEventId,
    validateCustomNotification,
};
