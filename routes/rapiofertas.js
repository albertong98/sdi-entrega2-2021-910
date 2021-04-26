module.exports = (app,gestorBD) => {
    app.get('/api/offer',(req,res) => obtenerOfertas(res,gestorBD));

    app.post('/api/autenticar/',(req,res) => autenticarUsuario(req,res,gestorBD,app));
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

    gestorBD.obtenerUsuarios(criterio, (usuarios) => {
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