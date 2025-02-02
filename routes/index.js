const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const vacanteController = require('../controllers/vacanteController.js');
const usuarioController = require('../controllers/usuarioController.js');
const authController = require('../controllers/authController.js')

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    //Crear vacantes
    router.get('/vacantes/nueva',
        authController.verificarUsuario,
        vacanteController.formularioNuevaVacante
    );
    router.post('/vacantes/nueva',
        authController.verificarUsuario,
        vacanteController.validarVacante,
        vacanteController.agregarVacante
    );
    
    //Mostrar vacante (singular)
    router.get('/vacantes/:url', vacanteController.mostrarVacante );

    //Editar vacante
    router.get('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacanteController.formEditarVacante 
    );
    router.post('/vacantes/editar/:url',
        authController.verificarUsuario,
        vacanteController.validarVacante,
        vacanteController.editarVacante
    );

    //Eliminar vacantes
    router.delete('/vacantes/eliminar/:id', 
        vacanteController.eliminarVacante
    );

    //Crear cuentas
    router.get('/crear-cuenta', usuarioController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuarioController.validarRegistro,
        usuarioController.crearUsuario
    ); 

    //Autenticar usuario
    router.get('/iniciar-sesion', usuarioController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    //Cerrar Sesion
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    //Resetear passwords
    router.get('/restablecer-password',
        authController.formRestablecerPassword);
    router.post('/restablecer-password',
        authController.enviarToken);

    //Resetear password y almacenar
    router.get('/restablecer-password/:token', authController.restablecerPassword);
    router.post('/restablecer-password/:token', authController.guardarPassword);
     

    //Panel de administracion
    router.get('/administracion',
        authController.verificarUsuario,
        authController.mostrarPanel
    );
    
    //Editar perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuarioController.formEditarPerfil
    );

    router.post('/editar-perfil',
        authController.verificarUsuario,
        //usuarioController.validarPerfil,
        usuarioController.subirImagen,
        usuarioController.editarPerfil
    )

    //Recibir mensajes de candidatos
    router.post('/vacantes/:url',
        vacanteController.subirCV,
        vacanteController.contactar
    );

    //Muestra los candidatos por vacante 
    router.get('/candidatos/:_id', 
        authController.verificarUsuario,
        vacanteController.mostrarCandidatos
    );

    //Buscador de vacantes
    router.post('/buscador', vacanteController.buscarVacantes)

    return router;
}