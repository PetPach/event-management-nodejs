const { check } = require('express-validator');

const validateEventId = [
    check('eventId').optional().isMongoId().withMessage('ID de evento inválido')
];

const validateCustomNotification = [
    check('userId').isMongoId().withMessage('ID de usuario inválido'),
    check('message').notEmpty().withMessage('El mensaje no puede estar vacío')
];

module.exports = {
    validateEventId,
    validateCustomNotification,
};
