const nodemailer = require('nodemailer');
const path = require('path');

// Usar import() dinámico para cargar nodemailer-express-handlebars
async function configurarEmail() {
    // Cargar nodemailer-express-handlebars dinámicamente como ESM
    const nodemailerExpressHandlebars = (await import('nodemailer-express-handlebars')).default;

    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure: false,
        auth: {
            user: "bcbbbda1c506aa",
            pass: "********7fcd",
        }
    });

    const handlebarOptions = {
        viewEngine: {
            extName: '.handlebars',
            partialsDir: path.join(__dirname, '../views/emails'),
            layoutsDir: path.join(__dirname, '../views/emails'),
            defaultLayout: false,
        },
        viewPath: path.join(__dirname, '../views/emails'),
        extName: '.handlebars',
    };

    transport.use('compile', nodemailerExpressHandlebars(handlebarOptions));

    return transport;
}

async function enviarEmail({ usuario, subject, resetUrl, archivo }) {
    const transport = await configurarEmail();

    const opciones = {
        from: '"DevJobs" <noreply@jobs4devs.com>',
        to: usuario.email,
        subject,
        template: archivo, // Nombre del archivo de la plantilla
        context: {
            resetUrl,
        },
    };

    try {
        await transport.sendMail(opciones);
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
}

module.exports = { enviarEmail };
