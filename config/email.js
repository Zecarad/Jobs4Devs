const nodemailer = require('nodemailer'); // Asegúrate de importar nodemailer

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // Usar TLS si es necesario
    auth: {
        user: "bcbbbda1c506aa",
        pass: "********7fcd",
        // Si necesitas especificar el método de autenticación
        // authMethod: "LOGIN"
    }
});
