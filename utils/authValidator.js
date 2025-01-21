const { check } = require("express-validator");

const validateUserRegistration = [
    check('username').exists().notEmpty().isLength({ min: 4, max: 40 }).withMessage('El nombre de usuario es requerido'),
    check('email').exists().notEmpty().isEmail().withMessage('Por favor incluye un email válido'),
    check('password').exists().notEmpty().isLength({ min: 8, max: 20 })
];

const validateUserLogin = [
    check('email').exists().notEmpty().isEmail(),
    check('password').exists().notEmpty()
];


const validateUpdateUserProfile = [
    check('username').optional().isLength({ min: 4, max: 40 }).withMessage('El nombre de usuario debe tener entre 4 y 40 caracteres'),
    check('email').optional().isEmail().withMessage('Por favor incluye un email válido')
];

module.exports = { validateUserRegistration, validateUserLogin, validateUpdateUserProfile }
