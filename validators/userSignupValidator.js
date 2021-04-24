module.exports =  {
    validarUsuario: (usuario) => {
        let mensajes = [];
        if(usuario.email == null )
            mensajes.push('El email no puede estar vacío.');
        if(usuario.email.length < 4)
            mensajes.push('El email tiene que tener una longitud de al menos 4 caracteres.');
        if(!usuario.email.includes('@'))
            mensajes.push('Formato de email no válido.');
        if(usuario.name == null)
            mensajes.push('El nombre no puede estar vacio');
        if(usuario.name.length < 4)
            mensajes.push('El nombre tiene que tener una longitud de al menos 4 caracteres.');
        if(usuario.lastname == null)
            mensajes.push('El apellido no puede estar vacio');
        if(usuario.lastname.length < 4)
            mensajes.push('El apellido tiene que tener una longitud de al menos 4 caracteres.');
        return mensajes;
    }
}