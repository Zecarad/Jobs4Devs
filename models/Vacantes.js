const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const shortid = require('shortid');

const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: 'El título de la vacante es obligatorio',
        trim: true
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: '0',
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        lowercase: true,
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
});

// Middleware pre-save para generar la URL única
vacantesSchema.pre('save', async function (next) {
    // Importación dinámica de `slug` dentro del middleware
    const slug = (await import('slug')).default;

    // Generar URL basada en el título
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`;

    next();
});

// Índice de búsqueda rápida en título, empresa, ubicación y skills
vacantesSchema.index({ titulo: 'text', empresa: 'text', ubicacion: 'text', skills: 'text' });

module.exports = mongoose.model('Vacante', vacantesSchema);
