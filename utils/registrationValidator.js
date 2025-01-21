const { check } = require('express-validator');

const validateEventId = [
    check('eventId').isMongoId().withMessage('ID de evento inválido')
];

module.exports = validateEventId;
