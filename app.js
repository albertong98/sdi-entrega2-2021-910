let express = require('express');
let app = express();

let fs = require('fs');
let https = require('https');

let crypto = require('crypto');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let swig = require('swig');

let mongo = require('mongodb');
let dburi = 'mongodb://admin:sdi@mywallapop-shard-00-00.vadns.mongodb.net:27017,mywallapop-shard-00-01.vadns.mongodb.net:27017,mywallapop-shard-00-02.vadns.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-gundmn-shard-0&authSource=admin&retryWrites=true&w=majority';

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

app.set('db',dburi);
app.set('clave','abcdefg');
app.set('crypto',crypto);
app.set('port',8081);

app.use(express.static('public'));

require("./routes/rusuarios.js")(app,swig,gestorBD);

https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});