const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Ejemplo usando Gmail
    auth: {
        user: process.env.EMAIL_USER, // Configurar en .env
        pass: process.env.EMAIL_PASS, // Configurar en .env
    },
});

const sendEmail = async ({ to, subject, text }) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
    } catch (error) {
        console.error('Error enviando correo:', error);
        throw new Error('No se pudo enviar el correo');
    }
};

module.exports = {
    sendEmail,
};
