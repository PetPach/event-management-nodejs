const { param } = require('express-validator');

const validateEventId = [
    param('eventId').isUUID().withMessage('ID de evento inválido')
];

module.exports = validateEventId;
