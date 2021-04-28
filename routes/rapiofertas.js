module.exports = (app,gestorBD) => {
    app.get('/api/offer',(req,res) => obtenerOfertas(res,gestorBD));

    app.post('/api/autenticar/',(req,res) => autenticarUsuario(req,res,gestorBD,app));

    app.post('/api/offer/mensaje/:id',(req,res) => sendMensaje(req,res,gestorBD));

    app.get('/api/conversacion/:id/:email',(req,res) => getConversacion(req,res,gestorBD));

    app.get('/api/conversaciones', getConversaciones(req,res,gestorBD));

    app.get('/api/conversacion/delete/:id/:email',(req,res) => deleteConversacion(req,res,gestorBD));
}

let obtenerOfertas = (res,gestorBD) => {
    gestorBD.obtenerOfertas( {'seller': {$not: res.usuario }} , ofertas => {
        if (ofertas == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(ofertas) );
        }
    });
}

let autenticarUsuario = (req,res,gestorBD,app) => {
    let seguro = app.get('crypto').createHmac('sha256',app.get('clave')).update(req.body.password).digest('hex');

    let criterio = { email: req.body.email, password: seguro };

    gestorBD.obtenerUsuarios(criterio, usuarios => {
        if(usuarios == null || usuarios.length == 0){
            res.status(401);
            res.json({ autenticado: false });
        }else{
            let token = app.get('jwt').sign(
                {usuario: criterio.email , tiempo: Date.now()/1000},
                "secreto");
            res.status(200);
            res.json({
                autenticado: true,
                token : token
            });
        }
    });
}

let sendMensaje = (req,res,gestorBD) => {
    let offerId = gestorBD.mongo.ObjectID(req.params.id);
    let mensaje = {
        comprador: res.usuario,
        autor: res.usuario,
        offerId: offerId,
        date: new Date().now(),
        text: req.body.text
    }
    gestorBD.insertarMensaje(mensaje, result => {
        if(result == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            });
        }else{
            res.status(201);
            res.json({
                mensaje : "mensaje enviado",
                _id : id
            });
        }
    });
}

let getConversacion = (req,res,gestorBD) => {
    let criterio = {'offerId': gestorBD.mongo.ObjectID(req.params.id), 'comprador': {$in: [res.usuario, req.params.email]}};

    gestorBD.obtenerMensajes(criterio, mensajes => {
        if(mensajes == null){
            res.status(500);
            res.json({
                error : "se ha producido un error"
            });
        }else{
            res.status(201);
            res.send( JSON.stringify(mensajes) );
        }
    });
}

let getConversaciones = (req,res,gestorBD) => {
    let criterio = { 'seller' : res.usuario }
    gestorBD.obtenerOfertas(criterio, ofertas => {
        if(ofertas == null) {
            res.status(500);
            res.json({
                error: "se ha producido un error"
            });
        }else{
            criterio = {$or: [{'offerId': {$in: ofertas.map(o => o._id)}}, {'comprador' : res.usuario}]};
            gestorBD.obtenerConversaciones(criterio,conversaciones => {
                if(conversaciones == null) {
                    res.status(500);
                    res.json({
                        error: "se ha producido un error"
                    });
                }else{
                    res.status(201);
                    res.send( JSON.stringify(conversaciones) );
                }
            })
        }
    });
}

let deleteConversacion = (req,res,gestorBD) => {
    let criterio = {'offerId' : gestorBD.mongo.ObjectID(req.params.id), 'email': req.params.email}

    gestorBD.borrarConversacion(criterio, result => {
        if(result == null){
            res.status(500);
            res.json({error: 'se ha producido un error'});
        }else{
            res.status(201);
            res.json({
                mensaje : "conversacion borrada",
                _id : id
            });
        }
    });
}