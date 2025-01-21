const jwtService = require('../services/jwtService');

const authMiddleware = (req, res, next) => {
    // Obtén el token del encabezado de autorización
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'No token provided, authorization denied' });
    }

    // Verifica que el formato del token sea correcto
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ msg: 'Token format is invalid, authorization denied' });
    }

    // Verificación del token
    try {
        const decoded = jwtService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ msg: 'Token is not valid' });
        }
        req.user = decoded.user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ msg: 'Token verification failed, authorization denied' });
    }
};

module.exports = authMiddleware;
