module.exports = (app,gestorBD) => {
	//Petición GET para mostrar las ofertas de usuarios distintos al autenticado
    app.get('/api/offer',(req,res) => obtenerOfertas(res,gestorBD));
	//Petición POST para autenticar al usuario
    app.post('/api/autenticar/',(req,res) => autenticarUsuario(req,res,gestorBD,app));
	//Petición POST que añade un mensaje a la base de datos
    app.post('/api/conversacion/mensaje',(req,res) => sendMensaje(req,res,gestorBD));
	//Petición GET para recuperar una conversación asignada a una oferta (id) y un interesado (email).
    app.get('/api/conversacion/:id/:email',(req,res) => getConversacion(req,res,gestorBD));
	//Petición GET para recuperar la lista de conversaciones abiertas del usuario autenticado
    app.get('/api/conversaciones', (req,res) => getConversaciones(req,res,gestorBD));
	//Petición DELETE para borrar una conversación asignada a una oferta (id) y un interesado (email).
    app.delete('/api/conversacion/:id/:email',(req,res) => deleteConversacion(req,res,gestorBD));
}

let obtenerOfertas = (res,gestorBD) => {
    console.info('Usuario '+res.usuario+' accediendo a listado de ofertas');
    gestorBD.obtenerOfertas( {'seller': {$nin: [res.usuario] }} , ofertas => {
        if (ofertas == null) {
            res.status(500);
            console.error('Error en la base de datos al obtener las ofertas');
            res.json({
                error : "se ha producido un error"
            })
        } else {
            console.info('Ofertas obtenidas satisfactoriamente.');
            res.status(200);
            res.json({email: res.usuario,ofertas:ofertas});
        }
    });
}

let autenticarUsuario = (req,res,gestorBD,app) => {
    console.info('Usuario '+req.body.email+' intentando iniciar sesion');
    let seguro = app.get('crypto').createHmac('sha256',app.get('clave')).update(req.body.password).digest('hex');

    let criterio = { email: req.body.email, password: seguro };

    gestorBD.obtenerUsuarios(criterio, usuarios => {
        if(usuarios == null || usuarios.length == 0){
            res.status(401);
            console.warn('El usuario '+req.body.email+' no ha podido autenticarse');
            res.json({ autenticado: false });
        }else{
            console.info('Usuario '+req.body.email+' autenticado correctamente.');
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
    console.info('Usuario '+res.usuario+' intentando enviar un mensaje a una oferta');
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
            console.error('Error al insertar el mensaje en la base de datos');
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
    console.info('Usuario '+res.usuario+' intentando acceder a la conversacion para la oferta '+req.params.id+' e interesado '+req.params.email);
    let criterio = {'ofertaId': gestorBD.mongo.ObjectID(req.params.id), 'comprador': {$in: [res.usuario, req.params.email]}};

    gestorBD.obtenerMensajes(criterio, mensajes => {
        if(mensajes == null){
            res.status(500);
            console.error('Error al acceder a la conversacion para la oferta '+req.params.id+' e interesado '+req.params.email);
            res.json({
                error : "se ha producido un error"
            });
        }else{
            criterio['autor'] = {$nin: [res.usuario]};
            gestorBD.marcarLeidos(criterio, result => {
                if(result == null){
                    res.status(500);
                    console.error('Error al acceder al marcar mensajes como leidos de la conversacion para la oferta '+req.params.id+' e interesado '+req.params.email);
                    res.json({error : "se ha producido un error al marcar mensajes como leidos"});
                }else{
                    res.status(201);
                    console.info('Conversacion para la oferta '+req.params.id+' e interesado '+req.params.email+' obtenida correctamente');
                    res.send( JSON.stringify(mensajes) );
                }
            });
        }
    });
}

let getConversaciones = (req,res,gestorBD) => {
    console.info('Usuario '+res.usuario+' accediendo a su lista de conversaciones.');
    let criterio = { 'seller' : res.usuario }
    let conversaciones = [];
    gestorBD.obtenerOfertas(criterio, ofertas => {
        if(ofertas == null) {
            console.error('Error al recuperar las ofertas de la base de datos para el usuario '+res.usuario)
            res.status(500);
            res.json({error: "se ha producido un error"});
        }else{
			//Tomamos como criterio que el id de la oferta esté entre los ids de las ofertas del usuario, o que el email del interesado sea igual al del usuario
            criterio = {$or: [{'offerId': {$in: ofertas.map(o => o._id)}}, {'comprador' : res.usuario}]};
            gestorBD.obtenerConversaciones(criterio,mensajes => {
                if(mensajes == null) {
                    console.error('Error al recuperar las conversaciones de la base de datos para el usuario '+res.usuario)
                    res.status(500);
                    res.json({error: "se ha producido un error"});
                }else{
                    criterio = {"_id" : {$in: mensajes.map(m => m._id.ofertaId)}}
					//Obtenemos las ofertas que esten relacionadas a las conversaciones del usuario
                    gestorBD.obtenerOfertas(criterio, offers => {
                        if (offers.length > 0) {
                            mensajes.forEach(m => {
                                let oferta = offers.find(o => o._id.toString() === m._id.ofertaId.toString());
								//Creamos un objeto conversacion que incluya los datos de la oferta y lo añadimos a una lista
                                conversaciones.push({
                                    title: oferta.title,
                                    ofertante: oferta.seller,
                                    offerId: oferta._id,
                                    comprador: m._id.comprador
                                });
                            });
                        }
                        console.info('Conversaciones de '+res.usuario+' obtenidas satisfactoriamente.');
                        res.status(201);
                        res.send(JSON.stringify(conversaciones));
                    });

                }
            })
        }
    });
}

let deleteConversacion = (req,res,gestorBD) => {
    console.info('Usuario '+res.usuario+' borrando la conversacion para la oferta '+req.params.id+' e interesado '+req.params.email);
    let criterio = {'ofertaId' : gestorBD.mongo.ObjectID(req.params.id), 'comprador': req.params.email}

    gestorBD.borrarConversacion(criterio, result => {
        if(result == null){
            res.status(500);
            console.error('Error al borrar la conversacion de la base de datos');
            res.json({error: 'se ha producido un error'});
        }else{
            res.status(200);
            console.info('Conversacion eliminada satisfactoriamente');
            res.send(JSON.stringify(result));
        }
    });
}