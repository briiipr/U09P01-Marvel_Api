addEventListener('load', agregaEventos, false)

var divContenido = document.getElementById('contenido')
var radios = document.getElementsByName('opcionEscogida')
var buscador = document.getElementById('buscador')
var spinner = document.getElementById('spinner')
var textoEntrada = document.getElementById('textoEntrada')
var opcionPrevia, opcionActual
var seHaEscogidoOpcion = false
const apiKey = "50428e524ea0dccc9d6f79647b5218f5"
const nMaximo = 100
var conexionPersonajes, conexionComics
var datosPersonajes, datosComics
var yaCargado = false

function agregaEventos() {
    radios.forEach(x => x.addEventListener('click', cambiaOpcion))
    buscador.addEventListener('keyup', buscaDatos)
    obtenDatos()
}


function cambiaOpcion() { // Cuando se escoge un <input type="radio"> u otro se verifica que no sea el mismo que el previo
    seHaEscogidoOpcion = true
    opcionActual = this.value
    textoEntrada.style.display = 'none'
    if (opcionPrevia != opcionActual) {
        opcionPrevia = opcionActual
        borraContenidoInterno(divContenido)
        buscador.value = ''
        buscador.disabled = false
        $('#pagination').hide()
    }
    console.log(`Se ha escogido opcion ${this.value}`)
}

function buscaDatos() { 
    if (seHaEscogidoOpcion == true) {
        agregaContenido(opcionActual)
        $('#pagination').show()
    }
}

function obtenDatos() { // Ambas conexiones con sus eventos
    conexionPersonajes = new XMLHttpRequest();
    conexionComics = new XMLHttpRequest();
    conexionPersonajes.onreadystatechange = gestionaConexion
    conexionPersonajes.open('GET', `https://gateway.marvel.com:443/v1/public/characters?apikey=${apiKey}&limit=${nMaximo}`)
    conexionPersonajes.send()
    conexionComics.onreadystatechange = gestionaConexion
    conexionComics.open('GET', `https://gateway.marvel.com:443/v1/public/comics?apikey=${apiKey}&limit=${nMaximo}`)
    conexionComics.send()
}

function gestionaConexion() { // Controla que ambas conexiones sean exitosas y que pasados X segundos (en este caso 15 para GitHub Pages), se interprete como que no hay conexión
    if (conexionPersonajes.readyState == 4 && conexionPersonajes.status == 200 & conexionComics.readyState == 4 && conexionComics.status == 200) {
        spinner.style.display = 'none'
        datosPersonajes = JSON.parse(conexionPersonajes.response).data.results
        datosComics = JSON.parse(conexionComics.response).data.results
        console.log(datosComics)
        radios.forEach(x => x.disabled = false)
        yaCargado = true;
    } else {
        spinner.style.display = 'block';
        setTimeout(function () {
            if (yaCargado == false) {
                borraContenidoInterno(divContenido)
                let imgNotFound = document.createElement('img')
                imgNotFound.src = '../img/notFound.jpg'
                divContenido.appendChild(imgNotFound)
                let hError = document.createElement('h2')
                hError.innerText = 'Error: No se ha podido conectar con la Api de Marvel :('
                divContenido.appendChild(hError)
                seHaEscogidoOpcion = false
            }
        }, 15000)
    }
}

function agregaContenido(tipo) { // Agrega los datos de cada conexión según la opción escogida
    if (tipo === 'comics') {
        console.log('Es comic')
        borraContenidoInterno(divContenido)
        datosComics.filter(x => {
            return x.title.includes(buscador.value)
        }).forEach(x => {
            let divComic = document.createElement('div')
            divComic.className = 'tarjetaHeroe'
            divContenido.appendChild(divComic)
            let imagenComic = document.createElement('img')
            if (x.thumbnail.path.split('/').pop() === 'image_not_available') {
                imagenComic.src = '../img/mrX.jpg'
            } else {
                imagenComic.src = x.thumbnail.path + '.' + x.thumbnail.extension
            }
            imagenComic.className = 'imagen'
            divComic.appendChild(imagenComic)
            let ulInfo = document.createElement('ul')
            divComic.appendChild(ulInfo)
            let liTitulo = document.createElement('li')
            liTitulo.innerText = x.title
            ulInfo.appendChild(liTitulo)
            if (x.description != null) { // Si tiene descripcion, se agregan sus elementos
                let liDescripcion = document.createElement('li')
                liDescripcion.innerHTML = x.description.slice(0, 20)
                ulInfo.appendChild(liDescripcion)
                let spanRestoDescripcion = document.createElement('span')
                spanRestoDescripcion.innerHTML = x.description.slice(20)
                spanRestoDescripcion.style.display = 'none'
                liDescripcion.appendChild(spanRestoDescripcion)
                let botonLeer = document.createElement('button')
                botonLeer.innerText = 'Ver más'
                botonLeer.addEventListener('click', leerMasMenos)
                liDescripcion.appendChild(botonLeer)
            }
            if (x.urls.length > 0) { // Si tiene url's (que contengan información o enlaces interesantes), se agregan sus elementos
                let urlsAgregadas = new Array()
                x.urls.forEach(y => {
                    if (y.type === 'detail') {
                        if (!urlsAgregadas.includes(y.url)) {
                            let liDetalles = document.createElement('li')
                            liDetalles.innerHTML = `<a href=${y.url} target="_blank">Detalles</a>`
                            ulInfo.appendChild(liDetalles)
                            urlsAgregadas.push(y.url)
                        }
                    } else if (y.type === 'comiclink') {
                        if (!urlsAgregadas.includes(y.url)) {
                            let liDetalles = document.createElement('li')
                            liDetalles.innerHTML = `<a href=${y.url} target="_blank">Cómics</a>`
                            ulInfo.appendChild(liDetalles)
                            urlsAgregadas.push(y.url)
                        }
                    } else {
                        let liWiki = document.createElement('li')
                        liWiki.innerHTML = `<a href=${y.url} target="_blank">Wiki</a>`
                        ulInfo.appendChild(liWiki)
                    }
                })
            }
        })
        actualizaItems()
    } else {
        console.log('Es heroe')
        borraContenidoInterno(divContenido)
        datosPersonajes.filter(x => {
            return x.name.includes(buscador.value)
        }).forEach(x => {
            let divHeroe = document.createElement('div')
            divHeroe.className = 'tarjetaHeroe'
            divContenido.appendChild(divHeroe)
            let imagenHeroe = document.createElement('img')
            if (x.thumbnail.path.split('/').pop() === 'image_not_available') {
                imagenHeroe.src = '../img/mrX.jpg'
            } else {
                imagenHeroe.src = x.thumbnail.path + '.' + x.thumbnail.extension
            }
            imagenHeroe.className = 'imagen'
            divHeroe.appendChild(imagenHeroe)
            let ulInfo = document.createElement('ul')
            divHeroe.appendChild(ulInfo)
            let liNombre = document.createElement('li')
            liNombre.innerText = x.name
            ulInfo.appendChild(liNombre)
            if (x.description != null && x.description.length > 0) { // Si tiene descripcion, se agregan sus elementos
                let liDescripcion = document.createElement('li')
                liDescripcion.innerHTML = x.description.slice(0, 20)
                ulInfo.appendChild(liDescripcion)
                let spanRestoDescripcion = document.createElement('span')
                spanRestoDescripcion.innerHTML = x.description.slice(20)
                spanRestoDescripcion.style.display = 'none'
                liDescripcion.appendChild(spanRestoDescripcion)
                let botonLeer = document.createElement('button')
                botonLeer.innerText = 'Ver más'
                botonLeer.addEventListener('click', leerMasMenos)
                liDescripcion.appendChild(botonLeer)
            }
            if (x.urls.length > 0) { // Si tiene url's (que contengan información o enlaces interesantes), se agregan sus elementos
                let urlsAgregadas = new Array()
                x.urls.forEach(y => {
                    if (y.type === 'detail') {
                        if (!urlsAgregadas.includes(y.url)) {
                            let liDetalles = document.createElement('li')
                            liDetalles.innerHTML = `<a href=${y.url} target="_blank">Detalles</a>`
                            ulInfo.appendChild(liDetalles)
                            urlsAgregadas.push(y.url)
                        }
                    } else if (y.type === 'comiclink') {
                        if (!urlsAgregadas.includes(y.url)) {
                            let liDetalles = document.createElement('li')
                            liDetalles.innerHTML = `<a href=${y.url} target="_blank">Cómics</a>`
                            ulInfo.appendChild(liDetalles)
                            urlsAgregadas.push(y.url)
                        }
                    } else {
                        let liWiki = document.createElement('li')
                        liWiki.innerHTML = `<a href=${y.url} target="_blank">Wiki</a>`
                        ulInfo.appendChild(liWiki)
                    }
                })
            }
        })
        actualizaItems()
        console.log('Es heroe')
        console.log(tipo)
    }
    console.log($('#contenido').children())
}

/*
    A PARTIR DE AQUÍ SE GESTIONA EL PAGINADO
*/
var items;
var porPagina = 9;
var $paginator = $('#pagination')

$paginator.pagination({ 
    itemsOnPage: porPagina,
    cssStyle: 'dark-theme',
    onPageClick: function (nPagina) {
        var muestraDesde = porPagina * (nPagina - 1)
        var muestraHasta = muestraDesde + porPagina

        items.hide().slice(muestraDesde, muestraHasta).show()
    }
})

function actualizaItems() {
    console.log('Entra a actualizar')
    items = $('#contenido').children()
    $paginator.pagination('updateItems', items.length)

    var pagina = Math.min(
        $paginator.pagination('getCurrentPage'),
        $paginator.pagination('getPagesCount')
    )

    $paginator.pagination('selectPage', pagina)
}

actualizaItems()

/*
    TERMINA EL PAGINADO
*/

// Se gestiona el botón 'Ver más' de cada personaje/cómic
function leerMasMenos() {
    if (this.innerText === 'Ver más') {
        this.previousElementSibling.style.display = 'initial'
        this.innerText = 'Ver menos'
    } else {
        this.previousElementSibling.style.display = 'none'
        this.innerText = 'Ver más'
    }
}

// Dos funciones para borrar *recursivamente* un elemento y todos sus hijos
function borraContenidoInterno(elemento) {
    while (elemento.hasChildNodes()) {
        borra(elemento.firstChild);
    }
}

function borra(elemento) {
    while (elemento.hasChildNodes()) {
        borra(elemento.firstChild);
    }
    elemento.parentNode.removeChild(elemento);
}