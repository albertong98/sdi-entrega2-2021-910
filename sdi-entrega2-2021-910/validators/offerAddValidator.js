module.exports =  {
    validar: (oferta) => {
        let mensajes = [];
        if(oferta.title == null || oferta.title.length == 0 || !oferta.title.trim())
            mensajes.push('El título no puede estar vacío.');
        else if(oferta.title.length < 3)
            mensajes.push('El título tiene que tener una longitud de al menos 3 caracteres.');
        if(oferta.details == null || oferta.details.length == 0 || !oferta.details.trim())
            mensajes.push('La descripción no puede estar vacia');
        else if(oferta.details.length < 8)
            mensajes.push('La descripción tiene que tener una longitud de al menos 8 caracteres.');
        if(oferta.price <= 0)
            mensajes.push('El precio debe ser un valor positivo');
        return mensajes;
    }
}