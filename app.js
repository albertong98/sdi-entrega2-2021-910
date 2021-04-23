let express = require('express');
let app = express();

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

let routerErroresSession = express.Router();
routerErroresSession.use((req,res,next) =>{

});

app.set('db',dburi);
app.set('clave','abcdefg');
app.set('crypto',crypto);
app.set('port',8081);

app.use(express.static('public'));

app.use((req,res,next) => {
    if(req.session.mensajes == null)
        req.session.mensajes = [];
    next();
});

require("./routes/rusuarios.js")(app,swig,gestorBD);

https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});