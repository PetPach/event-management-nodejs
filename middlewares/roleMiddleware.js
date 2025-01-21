const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Acceso denegado: no tiene el rol adecuado' });
    }
    next();
};

module.exports = roleMiddleware;
