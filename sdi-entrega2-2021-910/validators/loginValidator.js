module.exports =  {
    validar: (email,password) => {
        let mensajes = [];
        if(email == null || email.length == 0 || !email.trim())
            mensajes.push('El email no puede estar vacío');
        if(password == null || password.length == 0 || !password.trim())
            mensajes.push('La contraseña no puede estar vacia');
        return mensajes;
    }
}