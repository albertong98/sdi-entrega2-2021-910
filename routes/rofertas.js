module.exports = (app,swig,gestorBD) => {
    app.get('/offer/add', (req,res) => getOffer(req,res,swig));

    app.post('/offer/add',(req,res) => postOffer(req,res,gestorBD));

    app.get('/offer/list',(req,res) => getPublicaciones(req,res,swig,gestorBD));

    app.get('/offer/delete/:id',(req,res) => deleteOffer(req,res,swig,gestorBD));

    app.get('/offer/search',(req,res) => getBusqueda(req,res,gestorBD,swig));

    app.get('/offer/buy/:id',(req,res) => buyOffer(req,res,swig,gestorBD));

    app.get('/compras',(req,res) => getCompras(req,res,swig,gestorBD));
}

let getOffer = (req,res,swig) => {
    console.info('Usuario '+req.session.usuario.email+' accediendo a la página para agregar ofertas');
    let respuesta = swig.renderFile('views/offer/bagregar.html', res.locals);
    req.session.mensajes = [];
    res.send(respuesta);
}

let postOffer = (req,res,gestorBD) => {
    console.info('Usuario '+req.session.usuario.email+' subiendo nueva oferta: '+req.body.title);
    let offerAddValidator = require("../validators/offerAddValidator.js");
    let oferta = {
        title: req.body.title,
        details: req.body.details,
        price: parseFloat(req.body.price),
        date: new Date(),
        seller: req.session.usuario.email
    }
    let mensajes = offerAddValidator.validar(oferta);

    if(mensajes.length > 0) reject(mensajes,'/offer/add',req,res);
    else{
        gestorBD.insertarOferta(oferta,id => {
            if(id == null) {
                console.error('Error al agregar la oferta a la base de datos');
                res.send(swig.renderFile('views/error.html', {error: 'Error al subir la oferta'}));
            }else{
                console.info('Oferta '+id.toString()+' añadida satisfactoriamente.');
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
    console.info('Usuario '+req.session.usuario.email+' accediendo a sus publicaciones ');
    let criterio = {'seller' : req.session.usuario.email }

    gestorBD.obtenerOfertas(criterio, ofertas => {
        if(ofertas == null) {
            console.error('Error al tratar de obtener las publicaciones del usuario '+req.session.usuario.email);
            res.send(swig.renderFile('views/error.html', {error: 'Error al listar sus publicaciones'}));
        }else{
            console.info('Publicaciones del usuario '+req.session.usuario.email+' obtenidas satisfactoriamente');
            res.locals.ofertas = ofertas;
            res.send(swig.renderFile('views/offer/bpublicaciones.html',res.locals));
        }
    });
}

let deleteOffer = (req,res,swig,gestorBD) => {
    console.info('Usuario '+req.session.usuario.email+' tratando de eliminar la oferta '+req.params.id);
   let criterio = {'_id' : gestorBD.mongo.ObjectID(req.params.id) }

   gestorBD.eliminarOferta(criterio, result => {
       if(result == null) {
           console.error('Error al eliminar la oferta '+req.params.id+' de la base de datos');
           res.send(swig.renderFile('views/error.html', {error: 'Error al eliminar la oferta ' + req.params.id}));
       }else {
           console.info('Oferta '+req.params.id+' borrada satisfactoriamente');
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
    if( req.query.busqueda != null ) {
        res.locals.busqueda = req.query.busqueda;
        criterio = {
            title: {$regex: ".*" + req.query.busqueda + ".*",$options: 'i'},
            seller: {$nin: [req.session.usuario.email] }
        };
        console.info('Usuario '+req.session.usuario.email+' realizando la busqueda de ofertas: '+req.query.busqueda);
    }else {
        criterio = {'seller': {$nin: [req.session.usuario.email]}};
        console.info('Usuario '+req.session.usuario.email+' realizando una busqueda de ofertas vacía');
    }

    let pg = parseInt(req.query.pg);
    if ( req.query.pg == null)
        pg = 1;
    gestorBD.obtenerOfertasPg(criterio, pg,(ofertas,total) => {
        if(ofertas == null) {
            console.error('Error al obtener la busqueda de la base de datos.');
            res.send(swig.renderFile('views/error.html', {error: 'Error al buscar ofertas'}));
        }else{
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
            console.info('Busqueda realizada correctamente');
            res.send(respuesta);
        }
    });
}

let buyOffer = (req,res,swig,gestorBD) =>{
    console.info('Usuario '+req.session.usuario.email+' tratando de comprar la oferta '+req.params.id);
    let ofertaId = gestorBD.mongo.ObjectID(req.params.id);
    let compra = {
        comprador: req.session.usuario.email,
        ofertaId : ofertaId
    }

    gestorBD.insertarCompra(compra, req.session.usuario.saldo, function (idCompra){
        if (idCompra == null) {
            console.error('Error al inserta la compra de la oferta '+compra.ofertaId+' por '+compra.comprador);
            res.send(swig.renderFile('views/error.html', {error: 'Error al comprar oferta'}));
        } else {
            console.info('Oferta '+compra.ofertaId+' comprada satisfactoriamente por '+compra.comprador);
            res.redirect("/compras");
        }
    });
}

let getCompras = (req,res,swig,gestorBD) => {
    console.info('Usuario '+req.session.usuario.email+' accediendo a sus compras');
    let criterio = {'comprador' : req.session.usuario.email};

    gestorBD.obtenerCompras(criterio, compras => {
        if(compras == null) {
            console.error('Error al obtener las compras de '+req.session.usuario.email);
            res.send(swig.renderFile('views/error.html', {error: 'Error al obtener las compras del usuario'}));
        }else {
            gestorBD.obtenerOfertas({'_id': {$in: compras.map(c => c.ofertaId) }}, ofertas => {
                if(ofertas == null) {
                    console.error('Error al obtener las ofertas de la base de datos');
                    res.send(swig.renderFile('views/error.html', {error: 'Error al obtener las compras del usuario'}));
                }else{
                    console.info('Compras de '+req.session.usuario.email+' obtenidas satisfactoriamente');
                    res.locals.ofertas = ofertas;
                    res.send(swig.renderFile('views/offer/bcompras.html', res.locals));
                }
            });
        }
    })
}

let reject = (mensajes,destino,req,res) => {
    console.warn('El servidor ha rechazado la petición');
    mensajes.forEach(m => {
        req.session.mensajes.push({
            mensaje: m,
            tipoMensaje: 'alert-danger'
        });
    });
    res.redirect(destino);
}

