module.exports =  {
    validarUsuario: (usuario,password,passwordConfirm) => {
        let mensajes = [];
        if(usuario.email == null || usuario.email.length == 0 || !usuario.email.trim())
            mensajes.push('El email no puede estar vacío.');
        else if(usuario.email.length < 4)
            mensajes.push('El email tiene que tener una longitud de al menos 4 caracteres.');
        if(!usuario.email.includes('@'))
            mensajes.push('Formato de email no válido.');
        if(usuario.name == null || usuario.name.length == 0 || !usuario.name.trim())
            mensajes.push('El nombre no puede estar vacio');
        else if(usuario.name.length < 4)
            mensajes.push('El nombre tiene que tener una longitud de al menos 4 caracteres.');
        if(usuario.lastname == null || usuario.lastname.length == 0 || !usuario.lastname.trim())
            mensajes.push('El apellido no puede estar vacio');
        else if(usuario.lastname.length < 4)
            mensajes.push('El apellido tiene que tener una longitud de al menos 4 caracteres.');
        if(password == null || password.length == 0 || !password.trim())
            mensajes.push('La contraseña no puede estar vacia');
        else if(password.length < 4)
            mensajes.push('La contraseña debe tener una longitud de al menos 4 caracteres');
        if(password != passwordConfirm)
            mensajes.push('Las contraseñas no coinciden');
        return mensajes;
    }
}