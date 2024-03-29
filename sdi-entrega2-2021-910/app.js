let express = require('express');
let app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

let rest = require('request');
app.set('rest',rest);

let jwt = require('jsonwebtoken');
app.set('jwt',jwt);

let fs = require('fs');
let https = require('https');

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let crypto = require('crypto');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let swig = require('swig');

let mongo = require('mongodb');
let dburi = 'mongodb://admin:sdi@mywallapop-shard-00-00.vadns.mongodb.net:27017,mywallapop-shard-00-01.vadns.mongodb.net:27017,mywallapop-shard-00-02.vadns.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-gundmn-shard-0&authSource=admin&retryWrites=true&w=majority';

let gestorBD = require("./modules/gestorBD.js");

gestorBD.init(app,mongo);

//Router para restringir el acceso a usuarios sin identificar a ciertas direcciones de la API Rest
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    console.info('Comprobando que el usuario está autenticado y que tiene un token válido');
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                console.warn('Token invalido o caducado');
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                return;
            } else {
                // dejamos correr la petición
                console.info('Comprobación satisfactoria');
                res.usuario = infoToken.usuario;
                next();
            }
        });
    } else {
        console.warn('El usuario no está autenticado');
        res.status(403);
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
app.use('/api/offer', routerUsuarioToken);
app.use('/api/conversacion/', routerUsuarioToken);
app.use('/api/conversaciones', routerUsuarioToken);

//Router para impedir que un usuario abra o elimine conversaciones ajenas
let routerUsuarioAutorToken = express.Router();
routerUsuarioAutorToken.use((req,res,next) => {
    let path = require('path');
    let id = req.body.offerId || req.originalUrl.split('/')[3];
    let email = req.body.comprador || path.basename(req.originalUrl);

    console.info('Comprobando que el usuario '+res.usuario+' es participante de la conversacion');
	//Se comprueba si el usuario es el interesado en la oferta
    if(email == res.usuario) {
		//En caso de que sea el interesado, se deja correr la petición
        console.info('Comprobación satisfactoria');
        next();
    }else {
		//En caso contrario, se comprueba si el usuario es el vendedor de la oferta
        gestorBD.obtenerOfertas({_id: mongo.ObjectID(id)}, ofertas => {
            if (ofertas[0].seller == res.usuario) {
				//Si lo es, dejamos correr la petición
                console.info('Comprobación satisfactoria');
                next();
            }else {
				//Si no lo es, se le impide el acceso
                console.warn('El usuario '+res.usuario+' no ha podido acceder a la conversación al no ser participante');
                res.status(403);
                res.json({
                    acceso : false,
                    mensaje: 'No puede gestionar conversaciones ajenas'
                });
            }
        })
    }
});
app.use('/api/conversacion/:id/:email',routerUsuarioAutorToken);
app.use('/api/conversacion/mensaje',routerUsuarioAutorToken);

//Router para impedir el acceso a usuarios sin registrar el acceso a ciertas direcciones de la página web
let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.info('Comprobando que el usuario está autenticado');
    if ( req.session.usuario ) {
        // dejamos correr la petición
        console.info('Comprobación satisfactoria');
        next();
    } else {
        console.warn('Usuario sin autenticar intentando acceder a: '+req.session.destino);
        res.redirect("/identificarse");
    }
});
app.use('/offer/*',routerUsuarioSession);
app.use('/compras',routerUsuarioSession);
app.use('/usuario/list',routerUsuarioSession);
app.use('/usuario/delete',routerUsuarioSession);

//Router para impedir que usuarios como el administrador puedan subir, comprar o borrar ofertas.
let routerEstandar = express.Router();
routerEstandar.use((req,res,next) => {
    console.info('Comprobando que el usuario'+req.session.usuario.email+' tiene permiso para realizar la petición');
    if(req.session.usuario.rol == 'estandar') {
        console.info('Comprobación satisfactoria');
        next();
    }else{
        console.info('El usuario '+req.session.usuario.email+' no tiene permisos para realizar la petición');
        res.status(403);
        res.send(swig.renderFile('views/error.html',{error : 'Solo usuarios estandar pueden gestionar ofertas'}));
    }
});
app.post('/offer/add',routerEstandar);
app.use('/offer/delete',routerEstandar);
app.use('/offer/buy',routerEstandar);

//Router para impedir que un usuario borre ofertas ajenas y compre ofertas propias
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    let path = require('path');
    let id = path.basename(req.originalUrl);
	//Se comprueba si el usuario está intentando comprar o borrar una oferta
    let deleting = req.originalUrl.toString().includes('delete');
    console.info('Comprobando si el usuario '+req.session.usuario.email +' es dueño de la oferta '+id);
    gestorBD.obtenerOfertas(
        {_id: mongo.ObjectID(id) }, ofertas => {
			//Si la petición es para borrar la oferta, comprobamos que el usuario es el dueño, si es para comprar, lo contrario
            if((deleting && ofertas[0].seller == req.session.usuario.email) || ofertas[0].seller != req.session.usuario.email){
                console.info('Comprobación satisfactoria.');
                next();
            } else {
				//El usuario no tiene permitido realizar la petición, se muestra un mensaje en funcion de la petición que sea.
                console.warn('El usuario '+req.session.usuario.email+' ha realizado una petición no permitida para la oferta '+id);
                req.session.mensajes.push({
                    mensaje: deleting ? 'Solo puede borrar ofertas propias' : 'No puede comprar sus ofertas',
                    tipoMensaje: 'alert-danger'
                });
                res.redirect("/offer/list");
            }
        })
});
app.use('/offer/delete',routerUsuarioAutor);
app.use('/offer/buy',routerUsuarioAutor);

//Router para impedir que se vuelvan a comprar o se borren ofertas ya vendidas
let routerSold = express.Router();
routerSold.use((req,res,next) => {
    let path = require('path');
    let id = path.basename(req.originalUrl);
    console.info('Comprobando si la oferta '+id+' está vendida');
    gestorBD.obtenerCompras({'ofertaId' : id },compras => {
        if (compras != null && compras.length > 0) {
            console.warn('La oferta '+id+' ya está vendida');
            req.session.mensajes.push({
                mensaje: compras[0].comprador == req.session.usuario.email ? 'Ya ha comprado esa oferta'
                    : 'Esa oferta ya ha sido comprada por otro usuario',
                tipoMensaje: 'alert-danger'
            });
            res.redirect("/compras");
        }else {
            console.info('Comprobación satisfactoria.');
            next();
        }
    });
});
app.use('/offer/buy',routerSold);
app.use('/offer/delete',routerSold);

//Router para comprobar que el usuario dispone de suficiente saldo
let routerSaldo = express.Router();
routerSaldo.use((req,res,next) => {
    let path = require('path');
    let id = path.basename(req.originalUrl);
    console.info('Comprobando si el usuario '+req.session.usuario.email+' dispone de suficiente saldo para comprar la oferta '+id);
    gestorBD.obtenerOfertas({'_id': mongo.ObjectID(id) },ofertas => {
       if(ofertas != null && req.session.usuario.saldo >= ofertas[0].price){
           console.info('Comprobación satisfactoria');
           req.session.usuario.saldo -= ofertas[0].price;
           next();
       }else{
           console.info('El usuario'+req.session.usuario.email+' no dispone de saldo suficiente para comprar la oferta '+id);
           req.session.mensajes.push({
               mensaje: 'No dispone de saldo suficiente',
               tipoMensaje: 'alert-danger'
           });
           res.redirect("/compras");
       }
    });
});
app.use('/offer/buy',routerSaldo);

//Router que impide el acceso a la gestión de usuarios a personas distintas al administrador
let routerAdministrador = express.Router();
routerAdministrador.use((req,res,next) => {
    console.info('Comprobando si el usuario '+req.session.usuario.email+' dispone de permisos de administrador para acceder al recurso');
   if(req.session.usuario.rol == 'administrador') {
       console.info('Comprobación satisfactoria');
       next();
   }else{
       console.info('El usuario '+req.session.usuario.email+' no dispone de privilegios para acceder al recurso');
       res.status(403);
       res.send(swig.renderFile('views/error.html',{error : 'Solo el usuario administrador puede gestionar los usuarios'}));
   }
});
app.use('/usuario/list',routerAdministrador);
app.use('/usuario/delete',routerAdministrador);

//Router que permite que el usuario identificado y los mensajes sean accesibles por las vistas
app.use((req,res,next) => {
    if(req.session.mensajes == null)
        req.session.mensajes = [];
    res.locals.mensajes = req.session.mensajes
    if(req.session.usuario)
        res.locals.usuario = req.session.usuario;

    next();
});

app.set('db',dburi);
app.set('clave','abcdefg');
app.set('crypto',crypto);
app.set('port',8081);

app.use(express.static('public'));

require("./routes/rusuarios.js")(app,swig,gestorBD);
require("./routes/rofertas.js")(app,swig,gestorBD);
require("./routes/rapiofertas.js")(app,gestorBD);

//Insertar datos de prueba
//require("./insertSampleData.js")(app,gestorBD);


app.get('/', function (req, res) {
    res.send(swig.renderFile('views/index.html',res.locals));
});

https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});