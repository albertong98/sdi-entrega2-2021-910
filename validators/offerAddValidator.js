module.exports =  {
    validar: (oferta) => {
        let mensajes = [];
        if(oferta.titulo == null )
            mensajes.push('El título no puede estar vacío.');
        if(oferta.titulo.length < 3)
            mensajes.push('El título tiene que tener una longitud de al menos 3 caracteres.');
        if(oferta.details == null)
            mensajes.push('La descripción no puede estar vacia');
        if(oferta.details.length < 8)
            mensajes.push('La descripción tiene que tener una longitud de al menos 8 caracteres.');
        if(oferta.price <= 0)
            mensajes.push('El precio debe ser un valor positivo');
        return mensajes;
    }
}