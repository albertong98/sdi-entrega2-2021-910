module.exports = (app,gestorBD) => {
    gestorBD.eliminarUsuarios({},()=>{});
    gestorBD.eliminarOfertas({},()=>{});
    let password = app.get("crypto").createHmac('sha256', app.get('clave')).update('123456').digest('hex');
    let users = [
        {
            email : 'pedro@email.es',
            password :password,
            name: 'Pedro',
            lastname: 'Martinez',
            rol: 'estandar',
            saldo: 100.0
        },{
            email : 'lucas@email.es',
            password :password,
            name: 'Lucas',
            lastname: 'Garcia',
            rol: 'estandar',
            saldo: 100.0
        }, {
            email : 'maria@email.es',
            password :password,
            name: 'Maria',
            lastname: 'Fernandez',
            rol: 'estandar',
            saldo: 100.0
        }, {
            email : 'marta@email.es',
            password :password,
            name: 'Marta',
            lastname: 'Martinez',
            rol: 'estandar',
            saldo: 100.0
        },{
            email : 'pelayo@email.es',
            password :password,
            name: 'Pelayo',
            lastname: 'Martinez',
            rol: 'estandar',
            saldo: 100.0
        },{
            email : 'martin@email.es',
            password :password,
            name: 'Martin',
            lastname: 'Martinez',
            rol: 'estandar',
            saldo: 100.0
        },{
            email : 'alberto@email.com',
            password :password,
            name: 'Alberto',
            lastname: 'Martinez',
            rol: 'estandar',
            saldo: 100.0
        },{
            email : 'admin@email.com',
            password :app.get("crypto").createHmac('sha256', app.get('clave')).update('admin').digest('hex'),
            name: 'Admin',
            lastname: 'Admin',
            rol: 'administrador',
            saldo: 0.0
        }
    ];
    let offers = [
        {
            title: 'Coche',
            details: 'coche 2000 km',
            price: 10.0,
            date: new Date(),
            seller: 'pedro@email.es'
        }, {
            title: 'Cama',
            details: 'Cama con poco uso',
            price: 13.0,
            date: new Date(),
            seller: 'lucas@email.es'
        },{
            title: 'Joya',
            details: 'Joya con poco uso',
            price: 100.0,
            date: new Date(),
            seller: 'lucas@email.es'
        }, {
            title: 'Consola',
            details: 'Consola con poco uso',
            price: 20.0,
            date: new Date(),
            seller: 'maria@email.es'
        },{
            title: 'Avion',
            details: 'avion privado pocos km',
            price: 150.0,
            date: new Date(),
            seller: 'maria@email.es'
        },{
            title: 'Zapatos',
            details: 'Zapatos talla 39',
            price: 20.0,
            date: new Date(),
            seller: 'pelayo@email.es'
        },{
            title: 'Vaqueros',
            details: 'Vaqueros talla 42',
            price: 14.0,
            date: new Date(),
            seller: 'pelayo@email.es'
        },{
            title: 'Chaqueta',
            details: 'Chaqueta talla L',
            price: 15.0,
            date: new Date(),
            seller: 'pelayo@email.es'
        }
    ];
    users.forEach(u => gestorBD.insertarUsuario(u, () => {}));
    offers.forEach(o => gestorBD.insertarOferta(o, () => {}));
}