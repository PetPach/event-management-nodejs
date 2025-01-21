const bcryptService = require('../services/bcryptService');
const jwtService = require('../services/jwtService');
const { matchedData } = require('express-validator');
const { v4: uuidv4 } = require('uuid');  // si deseas IDs con uuid
const { findByEmail, createUser } = require('../models/userModel');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = matchedData(req);

    // 1. Verificar si ya existe el email
    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // 2. Hashear la contraseña
    const hashedPassword = await bcryptService.hashPassword(password);

    // 3. Crear usuario en DynamoDB
    const userId = uuidv4(); // o la lógica que prefieras
    const userData = {
      userId,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    await createUser(userData);

    // 4. Generar token
    const payload = { user: { id: userId, role: 'user' } };
    const token = jwtService.generateToken(payload);

    res.json({ token });
  } catch (err) {
    console.error('Error registrando usuario:', err);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = matchedData(req);

    // 1. Buscar usuario por email
    const user = await findByEmail(email);
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas: usuario no existe.' });
    }

    // 2. Comparar contraseñas
    const isMatch = await bcryptService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas: contraseña incorrecta.' });
    }

    // 3. Generar token
    const payload = { user: { id: user.userId, role: user.role } };
    const token = jwtService.generateToken(payload);

    res.json({ token });
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).json({
      msg: 'Error en el servidor, intente nuevamente más tarde.'
    });
  }
};

module.exports = { registerUser, loginUser };
