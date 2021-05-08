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
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403);
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});

app.use('/api/offer', routerUsuarioToken);

let routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});
app.use('/offer/add',routerUsuarioSession);
app.use('/offer/list',routerUsuarioSession);
app.use('/offer/delete',routerUsuarioSession);
app.use('/offer/buy',routerUsuarioSession);
app.use('/offer/search',routerUsuarioSession);
app.use('/compras',routerUsuarioSession);
app.use('/usuario/list',routerUsuarioSession);
app.use('/usuario/delete',routerUsuarioSession);

let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
    let deleting = req.originalUrl.toString().includes('delete');
    gestorBD.obtenerOfertas(
        {_id: mongo.ObjectID(id) }, ofertas => {
            if((deleting && ofertas[0].seller == req.session.usuario.email) || ofertas[0].seller != req.session.usuario.email){
                next();
            } else {
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

let routerSold = express.Router();
routerSold.use((req,res,next) => {
    let path = require('path');
    let id = path.basename(req.originalUrl);
    gestorBD.obtenerCompras({'ofertaId' : id },compras => {
        if (compras != null && compras.length > 0) {
            req.session.mensajes.push({
                mensaje: compras[0].comprador == req.session.usuario.email ? 'Ya ha comprado esa oferta'
                    : 'Esa oferta ya ha sido comprada por otro usuario',
                tipoMensaje: 'alert-danger'
            });
            res.redirect("/compras");
        }else
            next();
    });
});
app.use('/offer/buy',routerSold);

let routerSaldo = express.Router();
routerSaldo.use((req,res,next) => {
    let path = require('path');
    let id = path.basename(req.originalUrl);

    gestorBD.obtenerOfertas({_id: mongo.ObjectID(id) },ofertas => {
       if(ofertas != null && req.session.usuario.saldo >= ofertas[0].price){
           next();
       }else{
           req.session.mensajes.push({
               mensaje: 'No dispone de saldo suficiente',
               tipoMensaje: 'alert-danger'
           });
           res.redirect("/compras");
       }
    });
});
app.use('/offer/buy',routerSaldo);

let routerAdministrador = express.Router();
routerAdministrador.use((req,res,next) => {
   if(req.session.usuario.rol == 'administrador')
       next();
   else{
       res.status(403);
       res.send(swig.renderFile('/views/error.html',{error : 'Solo el usuario administrador puede gestionar los usuarios'}));
   }
});
app.use('/usuario/list',routerAdministrador);
app.use('/usuario/delete',routerAdministrador);

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

//Insertar datos
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