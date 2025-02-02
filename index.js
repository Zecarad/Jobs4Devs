const mongoose= require('mongoose');
require('./config/db')

const express = require('express');
const { create } = require('express-handlebars');
const path = require('path');
const router = require('./routes');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const sessionStore = new MongoStore({
    mongoUrl: process.env.DATABASE,
});
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');


require('dotenv').config( {path: 'variables.env'}); 

const app = express();

//Habilitar body-parser
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));

// Configura handlebars como el motor de vistas
const hbs = create({
    defaultLayout: 'layout',
    extname: '.handlebars',
    helpers: require('./helpers/handlebars'),
    // Desactivar la verificación de propiedades y métodos heredados
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
});


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Archivos estáticos   
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave:false,
    saveUninitialized: false,
    store: sessionStore
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Alertar y flash mensajes
app.use(flash());

//Crear middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash() || {}; 
    next();
});

app.use('/', router()) ;

//Not found
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
})

//Administracion de errores
app.use((error, req, res) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500;
    res.locals.status = status;
    res.status(status);
    res.render('error');
})

//Dejar que heroku, el servicio que aloja nuestro servidor, asigne el numero de puerto 
const host = '0.0.0.0';
const port = process.env.PORT;

app.listen(port, host, () => {
    console.log('Servidor operativo');
});
