const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
    usernameField : 'email',
    passwordField: 'password'
    }, async(email,passport,done) => {
        const usuario = await Usuarios.findOne({email});
        if(!usuario) return done(null, false, {
            message: 'Usuario No Existe'
        });
        
        //El usuario existe, verificar con metodo del modelo
        const verificarPass = usuario.compararPassword(passport);
        if(!verificarPass) return done(null,false, {
            message: 'Password Incorrecto'
        });

        //Usuario existe y password correcto
        return done(null, usuario);
    }));

    passport.serializeUser((usuario,done) => done(null, usuario._id));

    passport.deserializeUser(async (id,done) => {
        const usuario = await Usuarios.findById(id);
        return done(null, usuario);
    });

    module.exports= passport;