const passport = require('passport');
const mongoose = require('mongoose');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');
const Usuarios = mongoose.model('Usuarios');
const Vacante = mongoose.model('Vacante');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios',
});

exports.verificarUsuario = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/iniciar-sesion');
};

exports.mostrarPanel = async (req, res) => {
    const vacantes = await Vacante.find({ autor: req.user._id }).lean();
    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y administra tus vacantes',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        vacantes,
    });
};

exports.cerrarSesion = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash('correcto', 'Sesión cerrada correctamente');
        res.redirect('/iniciar-sesion');
    });
};

exports.formRestablecerPassword = (req, res) => {
    res.render('restablecer-password', {
        nombrePagina: 'Restablece tu password',
        tagline: 'Coloca tu email para recibir un enlace de recuperación',
    });
};

exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({ email: req.body.email });
    if (!usuario) {
        req.flash('error', 'El E-Mail no está registrado');
        return res.redirect('/iniciar-sesion');
    }

    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;
    await usuario.save();

    const resetUrl = `http://${req.headers.host}/restablecer-password/${usuario.token}`;
    await enviarEmail.enviarEmail({
        usuario,
        subject: 'Reestablece tu contraseña',
        resetUrl,
        archivo: 'reset',
      });

    req.flash('correcto', 'Revisa tu correo para continuar el proceso');
    res.redirect('/iniciar-sesion');
};

//Valida si el token es valido y existe el usuario
exports.restablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido');
        res.redirect('/restablecer-password');
    }

    // Correcto, mostrar el formulario
    res.render('nuevo-password',{
        nombrePagina: 'Nuevo Password'
    })
}

//Almacenar nuevo password
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt : Date.now()
        }
    });

    //No existe el usuario o token no valido
    if(!usuario) {
        req.flash('error', 'El formulario ya no es valido');
        res.redirect('/restablecer-password');
    }
    //Asignar nuevo password
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    //Agregar y eliminar valores al objeto  
    await usuario.save();

    //redirigir
    req.flash('Correcto', 'Password modificado correctamente');
    res.redirect('/iniciar-sesion');
} 

