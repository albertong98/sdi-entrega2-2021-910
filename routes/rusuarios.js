module.exports = (app,swig,gestorBD) => {
    app.get('/registrarse',(req,res) => getSignup(req,res,swig));

    app.get('/identificarse', (req,res) => getLogin(req,res,swig));

    app.get('/desconectarse', (req,res) => logout(req,res));

    app.post('/usuario', (req,res) => postUsuario(app,req,res,gestorBD,swig));

    app.post('/identificarse', (req,res) => identificarUsuario(app,req,res,gestorBD));

    app.get('/usuario/list', (req,res) => obtenerUsuarios(req,res,swig,gestorBD));

    app.post('/usuario/delete',(req,res) => deleteUsuarios(req,res,gestorBD,swig));
}

let getSignup = (req,res,swig) => {
    let respuesta = swig.renderFile('views/bregistro.html',  res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let getLogin = (req,res,swig) => {
    let respuesta = swig.renderFile('views/bidentificacion.html', res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let logout = (req,res) => {
    req.session.usuario = null;
    res.redirect('/identificarse');
}

let postUsuario = (app,req,res,gestorBD,swig) => {
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let userSignupValidator = require("../validators/userSignupValidator.js");

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
                        reject(['Error al registrar el usuario'],'/registrarse',req,res);
                    } else {
                        req.session.usuario = usuario;
                        res.redirect('/offer/add');
                    }
                });
            } else {
                reject(['El email ya está en uso'],'/registrarse',req,res);
            }
        });
    }
}

let identificarUsuario = (app,req,res,gestorBD) => {
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
                req.session.usuario = null;
                reject(['Email o password incorrecto'], '/identificarse', req, res)
            } else {
                req.session.usuario = usuarios[0];
                res.redirect("/offer/add");
            }
        });
    }
}

let obtenerUsuarios = (req,res,swig,gestorBD) =>{
    gestorBD.obtenerUsuarios({}, usuarios => {
        if (usuarios == null || usuarios.length == 0) {
            req.session.usuario = null;
            res.send(swig.renderFile('views/error.html',{error:'error al listar'}));
        } else {
            res.locals.usuarios = usuarios;
            res.send(swig.renderFile('views/busuarios.html',res.locals));
        }
    });
}

let deleteUsuarios = (req,res,gestorBD,swig) => {
    let criterio = {};
    req.body.idUser.forEach(id => {
        criterio = {"_id" : gestorBD.mongo.ObjectID(id) };
        gestorBD.borrarUsuario(criterio, result => {
            if(result == null)
                res.send(swig.renderFile('views/error.html',{error:'error al eliminar usuario '+id }));
        });
    });
    res.redirect('/usuarios');
}

let reject = (mensajes,destino,req,res) => {
    mensajes.forEach(m => {
        req.session.mensajes.push({
            mensaje: m,
            tipoMensaje: 'alert-danger'
        });
    });
    res.redirect(destino);
}