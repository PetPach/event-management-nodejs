const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { validateUserRegistration, validateUserLogin } = require('../utils/authValidator');
const validateResult = require('../utils/handleValidator');

// Ruta para el registro de usuarios
router.post('/register', validateUserRegistration, validateResult, registerUser);

// Ruta para el login de usuarios
router.post('/login', validateUserLogin, validateResult, loginUser);

module.exports = router;
