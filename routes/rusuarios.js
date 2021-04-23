module.exports = (app,swig,gestorBD) => {
    app.get('/registrarse',(req,res) => getSignup(res,swig));

    app.get('/identificarse', (req,res) => getLogin(req,res,swig));

    app.get('/desconectarse', (req,res) => logout(req,res));

    app.post('/usuario', (req,res) => postUsuario(app,req,res,gestorBD));

    app.post('/identificarse', (req,res) => identificarUsuario(app,req,res,gestorBD));

    app.get('/usuarios', (req,res) => obtenerUsuarios(app,req,res,swig,gestorBD))
}

let getSignup = (res,swig) => {
    let respuesta = swig.renderFile('views/bregistro.html',  {
        mensajes: req.session.mensajes
    });
    req.session.mensajes = [];
    res.send(respuesta);
}

let getLogin = (req,res,swig) => {
    let respuesta = swig.renderFile('views/bidentificacion.html', {
        mensajes: req.session.mensajes
    });
    req.session.mensajes = [];
    res.send(respuesta);
}

let logout = (req,res) => {
    req.session.usuario = null;
    res.send("Usuario desconectado");
}

let postUsuario = (app,req,res,gestorBD) => {
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let usuario = {
        email : req.body.email,
        password : seguro,
        saldo: 100.0
    }
    gestorBD.insertarUsuario(usuario, function(id) {
        if (id == null){
            req.session.mensajes.push({
                mensaje: 'Error al registrar el usuario',
                tipoMensaje: 'alert-danger'
            });
            res.redirect('/registrarse');
        } else {
            req.session.mensajes.push({
                mensaje: 'Nuevo usuario registrado',
                tipoMensaje: 'alert-info'
            });
            res.redirect('/identificarse');
        }
    });
}

let identificarUsuario = (app,req,res,gestorBD) => {
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let criterio = {
        email : req.body.email,
        password : seguro
    }
    gestorBD.obtenerUsuarios(criterio, function(usuarios) {
        if (usuarios == null || usuarios.length == 0) {
            req.session.usuario = null;
            req.session.mensajes.push({
                mensaje: 'Email o password incorrecto',
                tipoMensaje: 'alert-danger'
            });
            res.redirect("/identificarse");
        } else {
            req.session.usuario = usuarios[0].email;
            res.redirect("/");
        }
    });
}

let obtenerUsuarios = (app,req,res,swig,gestorBD) =>{
    let criterio = {};
    if(req.session.usuario != 'admin@email.com') {
        req.session.mensajes.push({
            mensaje: 'Solo el usuario administrador puede ver los usuarios',
            tipoMensaje: 'alert-danger'
        });
        res.redirect("/identificarse");
    }else{
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.send(swig.renderFile('views/error.html',{error:'error al listar'}));
            } else {
                res.send(swig.renderFile('views/busuarios.html',{
                    usuarios: usuarios
                }));
            }
        });
    }
}