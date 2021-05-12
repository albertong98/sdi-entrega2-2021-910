module.exports = (app,swig,gestorBD) => {
    //Petición GET que permite acceder a la página de registro
	app.get('/registrarse',(req,res) => getSignup(req,res,swig));
	
	//Petición GET que permite acceder a la página de inicio de sesión
    app.get('/identificarse', (req,res) => getLogin(req,res,swig));

	//Petición GET que permite al usuario registrado desconectarse
    app.get('/desconectarse', (req,res) => logout(req,res));
	
	//Petición POST que permite añadir un usuario a la base de datos
    app.post('/usuario', (req,res) => postUsuario(app,req,res,gestorBD,swig));
	
	//Petición POST que permite autenticar a un usuario
    app.post('/identificarse', (req,res) => identificarUsuario(app,req,res,gestorBD));

	//Petición GET que permite al administrador añadir a un usuario
    app.get('/usuario/list', (req,res) => obtenerUsuarios(req,res,swig,gestorBD));
	
	//Petición POST que permite al administrador borrar a uno o más usuarios
    app.post('/usuario/delete',(req,res) => deleteUsuarios(req,res,gestorBD,swig));
}

let getSignup = (req,res,swig) => {
    console.info("Usuario entrando a página de registro");
    let respuesta = swig.renderFile('views/bregistro.html',  res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let getLogin = (req,res,swig) => {
    console.info("Usuario entrando a página de identificación");
    let respuesta = swig.renderFile('views/bidentificacion.html', res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let logout = (req,res) => {
    console.info("Usuario "+req.session.usuario.email+" desconectando");
    req.session.usuario = null;
    res.redirect('/identificarse');
}

let postUsuario = (app,req,res,gestorBD,swig) => {
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let userSignupValidator = require("../validators/userSignupValidator.js");

    console.info("Creando usuario "+req.body.email);

    let usuario = {
        email : req.body.email,
        password : seguro,
        name: req.body.name,
        lastname: req.body.lastname,
        rol: 'estandar',
        saldo: 100.0
    }
    let mensajes = userSignupValidator.validarUsuario(usuario,req.body.password,req.body.passwordConfirm);

    if(mensajes.length > 0) reject(mensajes,'/registrarse',req,res);
    else {
        gestorBD.obtenerUsuarios({'email': usuario.email}, usuarios => {
            if (usuarios == null)
                res.send(swig.renderFile('views/error.html', {error: 'error al obtener usuarios'}));
            if (usuarios.length == 0) {
                gestorBD.insertarUsuario(usuario,  id => {
                    if (id == null) {
                        console.error("Error en la base de datos al registrar el usuario "+req.body.email);
                        res.send(swig.renderFile('views/error.html', {error: 'error en la base de datos al registrar el usuario'}));
                    } else {
                        console.info("Usuario "+req.body.email+" creado satisfactoriamente");
                        req.session.usuario = usuario;
                        res.redirect('/offer/add');
                    }
                });
            } else {
                console.warn("Usuario "+req.body.email+" intentando registrarse de nuevo");
                reject(['El email ya está en uso'],'/registrarse',req,res);
            }
        });
    }
}

let identificarUsuario = (app,req,res,gestorBD) => {
    console.info("Usuario intentando conectarse con email "+req.body.email);
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let loginValidator = require("../validators/loginValidator.js");
    let criterio = {
        email : req.body.email,
        password : seguro
    }
    let mensajes = loginValidator.validar(req.body.email,req.body.password);

    if(mensajes.length > 0) reject(mensajes,'/identificarse',req,res);
    else {
        gestorBD.obtenerUsuarios(criterio, usuarios => {
            if (usuarios == null || usuarios.length == 0) {
                console.warn("Usuario intentando conectarse con credenciales incorrectas");
                req.session.usuario = null;
                reject(['Email o password incorrecto'], '/identificarse', req, res)
            } else {
                console.info("Usuario autenticado como "+req.body.email);
                req.session.usuario = usuarios[0];
                res.redirect("/offer/add");
            }
        });
    }
}

let obtenerUsuarios = (req,res,swig,gestorBD) =>{
    console.info("Usuario identificado como "+req.session.usuario.email+" accediendo a listado de usuarios");
    let criterio = {"email": {$nin:["admin@email.com"]}};
    gestorBD.obtenerUsuarios(criterio, usuarios => {
        if (usuarios == null) {
            console.error("Error en la base de datos al obtener listado de usuarios");
            res.send(swig.renderFile('views/error.html',{error:'error al listar usuarios'}));
        } else {
            console.info("Listado de usuarios recuperado satisfactoriamente");
            res.locals.usuarios = usuarios;
            res.send(swig.renderFile('views/busuarios.html',res.locals));
        }
    });
}

let deleteUsuarios = (req,res,gestorBD,swig) => {
    console.info("Usuario identificado como "+req.session.usuario.email+" intentando borrar usuarios");
	//Comprobamos si el parametro es un array de emails, en caso afirmativo, pasamos como criterio que el email se encuentre en una lista, 
	//si no, pasamos como criterio que el email sea igual al email indicado en el parametro
    Array.isArray(req.body.emailUser) ? deleteUsersFromBD ({'email' : {$in: req.body.emailUser}},res,gestorBD,swig) :
                                        deleteUsersFromBD ({'email' : req.body.emailUser},res,gestorBD,swig);
}

let deleteUsersFromBD = (criterio,res,gestorBD,swig) => {
    gestorBD.borrarUsuarios(criterio, result => {
        if (result == null) {
            console.error("Error el la base de datos al intentar borrar usuarios "+criterio.toString());
            res.send(swig.renderFile('views/error.html', {error: 'error al eliminar usuarios'}));
        }else {
            console.info('Usuarios '+criterio.toString()+' borrados satisfactoriamente');
            res.redirect('/usuario/list');
        }
    });
}

let reject = (mensajes,destino,req,res) => {
	//Devolvemos una lista de mensajes de error y redireccionamos al destino indicado, donde se mostrarán al usuario
    console.warn('El servidor no permite la acción');
    mensajes.forEach(m => {
        req.session.mensajes.push({
            mensaje: m,
            tipoMensaje: 'alert-danger'
        });
    });
    res.redirect(destino);
}