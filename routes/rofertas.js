module.exports = (app,swig,gestorBD) => {
    app.get('/offer/add', (req,res) => getOffer(req,res,swig));

    app.post('/offer/add',(req,res) => postOffer(req,res,gestorBD));

    app.get('/offer/list',(req,res) => getPublicaciones(req,res,swig,gestorBD));

    app.get('/offer/delete/:id',(req,res) => deleteOffer(req,res,swig,gestorBD));

    app.get('/offer/search',(req,res) => getBusqueda(req,res,gestorBD,swig));

    app.get('/offer/buy/:id',(req,res) => buyOffer(req,res,swig,gestorBD));
}

let getOffer = (req,res,swig) => {
    let respuesta = swig.renderFile('views/offer/bagregar.html', res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let postOffer = (req,res,gestorBD) => {
    let offerAddValidator = require("./validators/offerAddValidator.js");
    let oferta = {
        title: req.body.title,
        details: req.body.details,
        price: req.body.price,
        date: new Date().now(),
        seller: req.session.usuario.email
    }
    let mensajes = offerAddValidator.validar(oferta);

    if(mensajes.length > 0) reject(mensajes,'/offer/add',req,res);
    else{
        gestorBD.insertarOferta(oferta,id => {
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

let deleteOffer = (req,res,swig,gestorBD) => {
   let criterio = {'_id' : gestorBD.mongo.ObjectID(req.params.id) }

   gestorBD.eliminarOferta(criterio, result => {
       if(result == null)
           swig.renderFile('views/error.html',{error: 'Error al eliminar la oferta '+req.params.id});
       else {
           req.session.mensajes.push({
               mensaje: 'Oferta eliminada',
               tipoMensaje: 'alert-info'
           });
           res.redirect('/offer/list');
       }
   });
}

let getBusqueda = (req,res,gestorBD,swig) =>{
    let criterio = {};
    if( req.query.busqueda != null )
        criterio = { "title" : {$regex : ".*"+req.query.busqueda+".*"}  };
    let pg = parseInt(req.query.pg);
    if ( req.query.pg == null)
        pg = 1;
    gestorBD.obtenerOfertasPg(criterio, (ofertas,total) => {
        if(ofertas == null)
            res.send(swig.renderFile('views/error.html',{error: 'Error al buscar oferta'}));
        else{
            let ultimaPg = total / 4;
            if (total % 4 > 0)
                ultimaPg = ultimaPg + 1;

            let paginas = [];
            for (let i = pg - 2; i <= pg + 2; i++)
                if (i > 0 && i <= ultimaPg)
                    paginas.push(i);

            res.locals.ofertas = ofertas;
            res.locals.paginas = paginas;
            res.locals.actual = pg;
            let respuesta = swig.renderFile('views/offer/bbusqueda.html', res.locals);
            res.send(respuesta);
        }
    });
}

let buyOffer = (req,res,swig,gestorBD) =>{
    let comprador = req.session.usuario;
    let oferta = {};
    let criterio = {'_id' : gestorBD.mongo.ObjectID(req.params.id)};
    gestorBD.obtenerOfertas(criterio, ofertas => {
        if(ofertas == null)
            res.send(swig.renderFile('views/error.html',{error: 'Error al obtener la oferta'}));
        else
            oferta = ofertas[0]
    });
    gestorBD.comprarOferta(oferta,comprador,() =>{

    });
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
