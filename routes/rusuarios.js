module.exports = (app,swig,gestorBD) => {
    app.get('/registrarse',(req,res) => getSignup(res,swig));

    app.get('/identificarse', (req,res) => getLogin(res,swig));

    app.get('/desconectarse', (req,res) => logout(req,res));

    app.post('/usuario', (req,res) => postUsuario(app,req,res,gestorBD));

    app.post("/identificarse", (req,res) => identificarUsuario(app,req,res,gestorBD));


}

let getSignup = (res,swig) => {
    let respuesta = swig.renderFile('views/bregistro.html', {});
    res.send(respuesta);
}

let getLogin = (res,swig) => {
    let respuesta = swig.renderFile('views/bidentificacion.html', {});
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
        password : seguro
    }
    gestorBD.insertarUsuario(usuario, function(id) {
        if (id == null){
            res.redirect('/registrarse?mensaje=Error al registrar el usuario&tipoMensaje=alert-danger');
        } else {
            res.redirect('/identificarse?mensaje=Nuevo usuario registrado');
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
            res.redirect("/identificarse" +
                "?mensaje=Email o password incorrecto"+
                "&tipoMensaje=alert-danger ");
        } else {
            req.session.usuario = usuarios[0].email;
            res.redirect("/publicaciones");
        }
    });
}