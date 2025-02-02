const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req,res) => {

    const vacantes = await Vacante.find().lean();

    if(!vacantes) return next();

    res.render('home', {
        nombrePagina : 'devJobs',
        tagline: 'Encontrar y publicar trabajos para desarrolladores web',
        barra: true,
        boton: true,
        vacantes
    })
}