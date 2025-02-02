const { check, validationResult  } = require('express-validator');
const mongoose = require('mongoose');
const multer = require('multer');
const shortid = require('shortid');
const Usuarios = mongoose.model('Usuarios');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error){
        if(error) {
            if(error instanceof multer.MulterError) {
                if(error.code ==='LIMIT_FILE_SIZE') {
                    req.flash('error', 'El Archivo Es Muy Grande, Máximo de 100kb ');
                } else {
                    req.flash('error', error.message); 
                }
            } else {
                req.flash('error', error.message);
            }
            res.redirect('/administracion');
            return;
        } else {
            return next();
        }

    });
}

//Opciones de Multer
const configuracionMulter = {
    limits : {fileSize : 100000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles')
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }  
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype ==='image/png' ) {
            //El callback se ejecuta como true o false: true si trae la imagen  
            cb(null, true);
        } else {
            cb(new Error('Formato No Valido'), false);
        } 
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear cuenta en DevJobs',
        tagline: 'Comienza a ingresar vacantes, solo debes crear una cuenta' ,
    })
}

exports.validarRegistro = [


    check('nombre', 'El nombre es Obligatorio').
    notEmpty().
    trim().
    escape(),
    
    check('email', 'El Email debe ser valido').
    isEmail().
    trim().
    escape(),

    check('password', 'El Password no puede ser vacio').
    notEmpty().
    trim().
    escape(),

    check('confirmar', 'Confirmar no puede ir vacio').
    notEmpty().
    trim().
    escape(),

    check('confirmar')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('El Password es diferente');
            }
            return true;
        }),

    (req,res,next) => {

    const errores = validationResult(req);  

    if (!errores.isEmpty()) {
        //Si hay errores
        req.flash('error', errores.array().map(error => error.msg ));

        res.render('crear-cuenta', {
            nombrePagina: 'Crear cuenta en DevJobs',
            tagline: 'Comienza a ingresar vacantes, solo debes crear una cuenta',
            mensajes: req.flash()
        })
        return;
    }
    //Si no hay errores 
    next();

}
];
exports.crearUsuario = async (req, res, next) => {
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        // Verificar si el error es por clave duplicada
        if (error.code === 11000) {
            req.flash('error', 'El correo electrónico ya está registrado');
        } else {
            req.flash('error', 'Hubo un problema al crear tu cuenta');
        }
        res.redirect('/crear-cuenta');
    }
};

//Formulario para iniciar sesion
exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesion'
    })
}

//form editar perfil
exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id).lean();

    res.render('editar-perfil', {
        nombrePagina : 'Editar perfil en DevJobs',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        usuario
    })
}

//Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password
    }

    if(req.file) {
        usuario.imagen = req.file.filename; 
    }

    await usuario.save();

    req.flash('correcto', 'cambios guardados')
    //redireccionar
    res.redirect('/administracion');
}

//Sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = [
    check('nombre').notEmpty().withMessage('Agrega un Nombre').escape(),
    check('email').notEmpty().withMessage('Agrega un Email').escape(),

    async (req, res, next) => {
        // Validar el password solo si está presente
        if (req.body.password) {
            await check('password').escape().run(req);
        }

        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            // Recuperar el usuario para renderizar la vista
            const usuario = await Usuarios.findById(req.user._id).lean();

            req.flash('error', errores.array().map(error => error.msg));

            return res.render('editar-perfil', {
                nombrePagina: 'Editar perfil en DevJobs',
                cerrarSesion: true,
                nombre: req.user.nombre,
                mensajes: req.flash(),
                imagen: req.user.imagen,
                usuario
            });
        }
        next();
    }
];



