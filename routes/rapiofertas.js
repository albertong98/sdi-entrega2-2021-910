module.exports = (app,gestorBD) => {
    app.get('/api/offer',(req,res) => obtenerOfertas(res,gestorBD));

    app.post('/api/autenticar/',(req,res) => autenticarUsuario(req,res,gestorBD,app));

    app.post('/api/conversacion/mensaje',(req,res) => sendMensaje(req,res,gestorBD));

    app.get('/api/conversacion/:id/:email',(req,res) => getConversacion(req,res,gestorBD));

    app.get('/api/conversaciones', (req,res) => getConversaciones(req,res,gestorBD));

    app.delete('/api/conversacion/:id/:email',(req,res) => deleteConversacion(req,res,gestorBD));
}

let obtenerOfertas = (res,gestorBD) => {
    gestorBD.obtenerOfertas( {'seller': {$nin: [res.usuario] }} , ofertas => {
        if (ofertas == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.json({email: res.usuario,ofertas:ofertas});
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
            let token = app.get('jwt').sign({usuario: criterio.email , tiempo: Date.now()/1000}, "secreto");
            res.status(200);
            res.json({
                autenticado: true,
                token : token
            });
        }
    });
}

let sendMensaje = (req,res,gestorBD) => {
    console.log("llegue");
    let mensaje = {
        comprador: req.body.comprador,
        autor: res.usuario,
        ofertaId: gestorBD.mongo.ObjectID(req.body.offerId),
        date: new Date(),
        text: req.body.texto,
        leido: false
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
                _id : result
            });
        }
    });
}

let getConversacion = (req,res,gestorBD) => {
    let criterio = {'ofertaId': gestorBD.mongo.ObjectID(req.params.id), 'comprador': {$in: [res.usuario, req.params.email]}};

    gestorBD.obtenerMensajes(criterio, mensajes => {
        if(mensajes == null){
            res.status(500);
            res.json({
                error : "se ha producido un error"
            });
        }else{
            criterio['autor'] = {$nin: [res.usuario]};
            gestorBD.marcarLeidos(criterio, result => {
                if(result == null){
                    res.status(500);
                    res.json({error : "se ha producido un error al marcar mensajes como leidos"});
                }else{
                    res.status(201);
                    res.send( JSON.stringify(mensajes) );
                }
            });
        }
    });
}

let getConversaciones = (req,res,gestorBD) => {
    let criterio = { 'seller' : res.usuario }
    let conversaciones = [];
    gestorBD.obtenerOfertas(criterio, ofertas => {
        if(ofertas == null) {
            res.status(500);
            res.json({error: "se ha producido un error"});
        }else{
            criterio = {$or: [{'offerId': {$in: ofertas.map(o => o._id)}}, {'comprador' : res.usuario}]};
            gestorBD.obtenerConversaciones(criterio,mensajes => {
                if(mensajes == null) {
                    res.status(500);
                    res.json({error: "se ha producido un error"});
                }else{
                    criterio = {"_id" : {$in: mensajes.map(m => m._id.ofertaId)}}
                    gestorBD.obtenerOfertas(criterio, offers => {
                        if (offers.length > 0) {
                            mensajes.forEach(m => {
                                let oferta = offers.find(o => o._id.toString() === m._id.ofertaId.toString());
                                conversaciones.push({
                                    title: oferta.title,
                                    ofertante: oferta.seller,
                                    offerId: oferta._id,
                                    comprador: m._id.comprador
                                });
                            });
                        }
                        res.status(201);
                        res.send(JSON.stringify(conversaciones));
                    });

                }
            })
        }
    });
}

let deleteConversacion = (req,res,gestorBD) => {
    let criterio = {'ofertaId' : gestorBD.mongo.ObjectID(req.params.id), 'comprador': req.params.email}

    gestorBD.borrarConversacion(criterio, result => {
        if(result == null){
            res.status(500);
            res.json({error: 'se ha producido un error'});
        }else{
            res.status(200);
            res.send(JSON.stringify(result));
        }
    });
}