const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt'); 

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    nombre: {
        type: String,
        required: 'Agrega tu Nombre',
    },
    password: {
        type: String,
        required: true,
        trim: true

    },
    token: String,
    expira: Date,
    imagen: String
});

//Metodo para hashear los passwords

usuarioSchema.pre('save', async function(next) {
    //Si el password ya esta hasehado no hacer nada 
    if(!this.isModified('password')) {
        return next();
    }
    //Si no está hasheado
    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash;
    next();  
});

//Enviar alerta cuando un usuario está registrado
usuarioSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        const customError = new Error('Correo ya está registrado');
        customError.code = 11000;
        next(customError);
    } else {
        next(error);
    }
});
//Autenticar usuarios
usuarioSchema.methods = {
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuarioSchema);