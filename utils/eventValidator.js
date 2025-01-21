const { check } = require("express-validator");

const validateCreateEvent = [
    check('title').exists().notEmpty().withMessage('El título es requerido'),
    check('description').exists().notEmpty().withMessage('La descripción es requerida'),
    check('date').exists().isISO8601().withMessage('La fecha es requerida y debe estar en formato ISO8601'),
    check('location').exists().notEmpty().withMessage('La ubicación es requerida'),
    check('type').exists().isIn(['conference', 'workshop', 'meeting']).withMessage('El tipo de evento es inválido'),
    check('capacity').exists().isInt({ gt: 0 }).withMessage('La capacidad debe ser un número entero positivo')
];

const validateUpdateEvent = [
    check('title').optional().notEmpty().withMessage('El título no puede estar vacío si se proporciona'),
    check('description').optional().notEmpty().withMessage('La descripción no puede estar vacía si se proporciona'),
    check('date').optional().isISO8601().withMessage('La fecha debe estar en formato ISO8601'),
    check('location').optional().notEmpty().withMessage('La ubicación no puede estar vacía si se proporciona'),
    check('type').optional().isIn(['conference', 'workshop', 'meeting']).withMessage('El tipo de evento es inválido'),
    check('capacity').optional().isInt({ gt: 0 }).withMessage('La capacidad debe ser un número entero positivo')
];

const validateEventId = [
    check('id').isMongoId().withMessage('ID de evento inválido')
];

module.exports = { validateCreateEvent, validateUpdateEvent, validateEventId };
