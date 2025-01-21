const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Ruta protegida básica
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    msg: 'Acceso concedido a la ruta protegida',
    user: req.user
  });
});

// Ruta protegida solo para administradores
router.get('/admin', authMiddleware, roleMiddleware(['admin']), (req, res) => {
  res.json({
    msg: 'Acceso concedido a la ruta de administrador',
    user: req.user
  });
});

module.exports = router;
