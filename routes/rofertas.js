module.exports = (app,swig,gestorBD) => {
    app.get('/offer/add', (req,res) => getOffer(req,res,swig));

    app.post('/offer/add',(req,res) => postOffer(req,res,gestorBD));

    app.get('/offer/list',(req,res) => getPublicaciones(req,res,swig,gestorBD));
}

let getOffer = (req,res,swig) => {
    let respuesta = swig.renderFile('views/offer/bagregar.html', res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let postOffer = (req,res,gestorBD) => {
    let oferta = {
        title: req.body.title,
        details: req.body.details,
        price: req.body.price,
        date: new Date().now(),
        seller: req.session.usuario.email
    }

    gestorBD.insertarOferta(oferta,(id) => {
        if(id == null)
            res.send(swig.renderFile('views/error.html',{error: 'Error al subir la oferta'}));
        else{
            req.session.mensajes.push({
                mensaje: 'Oferta agregada',
                tipoMensaje: 'alert-info'
            });
            res.redirect('/offer/list');
        }
    });
}

let getPublicaciones = (req,res,swig,gestorBD) => {
    let criterio = {'seller' : req.session.usuario.email }

    gestorBD.obtenerOfertas(criterio, ofertas => {
        if(ofertas == null)
            swig.renderFile('views/error.html',{error: 'Error al listar sus publicaciones'});
        else{
            res.locals.ofertas = ofertas;
            res.send(swig.renderFile('views/offer/bpublicaciones.html',res.locals));
        }
    });
}