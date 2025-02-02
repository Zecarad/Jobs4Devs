const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'LLena el formulario para ingresar una nueva Vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//Agregar Vacantes a base de datos
exports.agregarVacante = async (req,res) => {
    const vacante = new Vacante(req.body);

    //Usuario autor de la vacante
    vacante.autor = req.user._id;

    //Crear arreglo de habilidades
    vacante.skills = req.body.skills.split(',');

    //Almacenar en base de datos
    const nuevaVacante = await vacante.save()

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`); 
}

//Muestra una vacante
exports.mostrarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor');
    //Sin resultados
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req,res,next) => {
    const vacante = await Vacante.findOne({ url: req.params.url}).lean();

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina : `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    
    })
}

exports.editarVacante = async (req,res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate( {url: req.params.url}, vacanteActualizada, {
        new: true,
        runValidators: true
    } );
    res.redirect(`/vacantes/${vacante.url}`)
}

//Validar y Sanitizar los campos de las nuevas vacantes 
const { body, validationResult } = require('express-validator');
const { cerrarSesion } = require('./authController');

exports.validarVacante = [
    // Validación y sanitización
    body('titulo').notEmpty().withMessage('Agregar un Titulo a la Vacante').escape(),
    body('empresa').notEmpty().withMessage('Agregar una Empresa').escape(),
    body('ubicacion').notEmpty().withMessage('Agregar una Ubicación').escape(),
    body('salario').optional().escape(),
    body('contrato').notEmpty().withMessage('Selecciona el tipo de Contrato').escape(),
    body('skills').notEmpty().withMessage('Agrega al Menos una Habilidad').escape(),

    // Middleware para manejar errores
    (req, res, next) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            // Muestra los errores en la vista
            req.flash('error', errores.array().map(error => error.msg));

            return res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'Llena el formulario para ingresar una nueva Vacante',
                cerrarSesion: true,
                nombre: req.user.nombre,
                mensajes: req.flash()
            });
        }
        next();
    }
];

exports.eliminarVacante = async (req,res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)){
        //Eliminar si es el usuario
        await vacante.deleteOne();
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        //No permitido
        res.status(403).send('Error')
    }
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if (!vacante.autor.equals(usuario._id)) {
        return false
    }   
    return true;
}

//Subir archivos en PDF
exports.subirCV = (req, res, next) => {
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
            res.location(req.get("Referrer") || "/");            
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
            cb(null, __dirname+'../../public/uploads/cv')
        },
        filename : (req, file, cb) => {
            const extension = file.mimetype.split('/')[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }  
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf') {
            //El callback se ejecuta como true o false: true si trae la imagen  
            cb(null, true);
        } else {
            cb(new Error('Formato No Valido'), false);
        } 
    }
}

const upload = multer(configuracionMulter).single('cv');

//Almacenar candidatos en base de datos
exports.contactar = async(req, res, next) => {
    console.log(req.file); // Esto te ayudará a verificar si req.file existe.
    const vacante = await Vacante.findOne({ url: req.params.url }).lean().populate('autor');

    if (!vacante) return next();

    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file ? req.file.filename : null // Verifica si req.file existe antes de acceder a 'filename'
    };

    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    req.flash('correcto', 'Se envió tu Postulacion Correctamente');
    res.redirect('/');
}

exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params._id).lean();

    if (!vacante) return next();

    if (vacante.autor.toString() !== req.user._id.toString()) {
        return res.status(403).send('No autorizado para ver los candidatos');
    }

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    });
};

//Buscador de vacantes
exports.buscarVacantes = async (req,res) => {
    const vacantes = await Vacante.find({
        $text : {
            $search : req.body.q
        }
    });

    //Mostrar las vacantes
    res.render('home', {
        nombrePagina : `Resultados para la busqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}
