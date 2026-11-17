//Cambiar de color el tema de la página
document.addEventListener("DOMContentLoaded", () => {
    //Lógica del botón para cambiar el tema
    const BotonTema = document.getElementById("cambiar-tema");
    
    if (BotonTema) {
        BotonTema.addEventListener("click", () => {
            document.body.classList.toggle("modo-claro");

            if (document.body.classList.contains("modo-claro")) {
                BotonTema.textContent = "☀️";
            } else {
                BotonTema.textContent = "🌙"
            }
        });
    }
});

//Función para que cuando el usuario toque el enlace de explorar lo redirija a la barra de navegación
// Llevar al buscador al tocar Explorar
const enlaceExplorar = document.getElementById("enlace-explorar");
const buscador = document.getElementById("buscador");

enlaceExplorar.addEventListener("click", (e) => {
    e.preventDefault();

    buscador.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    buscador.focus();
});

/* ==========================================================================
   1. VARIABLES Y ESTADO INICIAL
   ========================================================================== */

const seccionPublicaciones = document.querySelector(".Publicaciones");
const formulario = document.querySelector(".Publicar form");
const formSection = document.querySelector(".Publicar");

const inputNombre = document.getElementById("Nombre");
const inputContenido = document.getElementById("Contenido");
const selectCategoria = document.getElementById("categoria");

let publicaciones = [];
let filtroActual = "";

// Convertir texto a un formato fácil de comparar
function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

// Evitar que el contenido escrito por los usuarios se interprete como HTML
function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caracter]);
}


/* ==========================================================================
   2. CARGAR LAS PUBLICACIONES QUE YA EXISTEN EN EL HTML
   ========================================================================== */

function cargarPublicacionesIniciales() {
    if (!seccionPublicaciones) return;

    const articulos = seccionPublicaciones.querySelectorAll(
        ":scope > article.publicacion"
    );

    articulos.forEach((articulo, indice) => {
        const nombre = articulo.querySelector(".Usuario h3");
        const informacion = articulo.querySelector(".Usuario p");
        const contenido = articulo.querySelector(".ContentPub p");

        const imagenes = Array.from(
            articulo.querySelectorAll(".ContentPub img")
        ).map(img => img.getAttribute("src"));

        const textoInfo = informacion ? informacion.textContent : "";
        const partes = textoInfo.split("·").map(parte => parte.trim());

        const coincidencia = textoInfo.match(/Categor[ií]a:\s*(.+)$/i);

        const botonLike = articulo.querySelector(
            ".Interacciones button:first-child"
        );

        const contador = botonLike
            ? botonLike.querySelector(".contador")
            : null;

        publicaciones.push({
            id: indice + 1,
            usuario: nombre ? nombre.textContent.trim() : "Usuario",
            arroba: partes[0] || "@usuario",
            tiempo: partes[1] || "Reciente",
            categoria: coincidencia ? coincidencia[1].trim() : "General",
            contenido: contenido ? contenido.textContent.trim() : "",
            imagenes: imagenes,
            likes: contador ? Number(contador.textContent) || 0 : 0,
            avatar: articulo.querySelector(".encabezadoPubli img")?.getAttribute("src") || "Imagenes/perfil1.jpg"
        });
    });
}


/* ==========================================================================
   3. RENDERIZADO DE PUBLICACIONES
   ========================================================================== */
function obtenerPublicacionesFiltradas() {
    if (!filtroActual) return publicaciones;

    return publicaciones.filter(pub => {
        const categoria = normalizarTexto(pub.categoria);

        return (
            categoria === filtroActual ||
            filtroActual.includes(categoria) ||
            categoria.includes(filtroActual)
        );
    });
}

function mostrarPublicaciones(lista = publicaciones) {
    if (!seccionPublicaciones) return;

    // Eliminar publicaciones dinámicas anteriores
    seccionPublicaciones.querySelectorAll(":scope > article.publicacion").forEach(articulo => articulo.remove());

    // Eliminar mensaje vacío anterior
    const mensajeAnterior = seccionPublicaciones.querySelector(".mensaje-vacio");

    if (mensajeAnterior) {
        mensajeAnterior.remove();
    }

    // Comprobar si existen publicaciones
    if (lista.length === 0) {
        alert("En este momento todavía no hay publicaciones en esta categoría");
        return;
    }

    // Mostrar publicaciones
    lista.forEach(pub => {
        const article = document.createElement("article");

        article.classList.add("publicacion", "publicacion-dinamica");
        article.dataset.id = pub.id;
        
        const imagenesHTML = (pub.imagenes || [])
            .map(imagen => `
                <img
                    class="AlbumImage"
                    src="${escaparHTML(imagen)}"
                    alt="Imagen de la publicación"
                    width="200"
                    height="200"
                >
            `).join("");

        article.innerHTML = `
            <header class="encabezadoPubli">
                <img
                    src="${escaparHTML(pub.avatar || "Imagenes/perfil1.jpg")}"
                    alt="Foto de perfil"
                    width="50"
                    height="50"
                >

                <div class="Usuario">
                    <h3>${escaparHTML(pub.usuario)}</h3>
                    <p>
                    ${escaparHTML(pub.arroba)}
                    · ${escaparHTML(pub.tiempo)}
                    · Categoría: ${escaparHTML(pub.categoria)}
                    </p>
                </div>

                <button type="button" class="BotonEliminar" aria-label="Eliminar publicación">
                    <span class="IconoEliminar">🗑️</span>
                    <span class="TextoEliminar">Eliminar publicación</span>
                </button>
            </header>

            <section class="ContentPub">
                <p>${escaparHTML(pub.contenido)}</p>
                ${imagenesHTML}
            </section>

            <footer class="Interacciones">
                <button type="button" class="btn-like" data-id="${pub.id}">
                    ❤️ Me gusta
                    <span class="contador">${pub.likes}</span>
                </button>

                <button type="button" data-accion="comentar" data-id="${pub.id}">
                    💬 Comentar <span class="contador">0</span>
                </button>

                <button type="button" data-accion="compartir" data-id="${pub.id}">
                    ↗️ Compartir <span class="contador">0</span>
                </button>

                <button type="button" data-accion="guardar" data-id="${pub.id}">
                    🔖 Guardar <span class="contador">0</span>
                </button>
            </footer>
        `;

        if (formSection && formSection.parentElement === seccionPublicaciones) {
            seccionPublicaciones.insertBefore(article, formSection);
        } else {
            seccionPublicaciones.appendChild(article);
        }
    });
}



/* ==========================================================================
   4. SISTEMA DE LIKES Y BOTONES
   ========================================================================== */

document.addEventListener("click", function(evento) {
    const boton = evento.target.closest("button");

    if (!boton) return;
    
    // Eliminar publicación
    if (boton.classList.contains("BotonEliminar")) {
        const articulo = boton.closest(".publicacion");
        const id = Number(articulo.dataset.id);

        if (confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
            publicaciones = publicaciones.filter(pub => pub.id !== id);
            
            const lista = obtenerPublicacionesFiltradas();
            mostrarPublicaciones(lista);

            if (lista.length > 0) {
                alert("¡La publicación se eliminó correctamente!");
            }
        }

        return;
    }
    
    // Sistema de likes
    if (boton.classList.contains("btn-like")) {
        const id = Number(boton.dataset.id);

        const publicacion = publicaciones.find(pub => pub.id === id);

        if (publicacion) {
            publicacion.likes++;

            const contador = boton.querySelector(".contador");

            if (contador) {
                contador.textContent = publicacion.likes;
            }
        }
    }

    // Sistema de comentarios
    if (boton.dataset.accion === "comentar") {
        alert("¡Próximamente podrás comentar esta publicación!");
    }

    // Sistema de compartir
    if (boton.dataset.accion === "compartir") {
        alert("¡Gracias por compartir!");
    }

    // Sistema de guardar
    if (boton.dataset.accion === "guardar") {
        alert("¡Publicación guardada!");
    }
});


/* ==========================================================================
   5. CREAR NUEVAS PUBLICACIONES
   ========================================================================== */

if (formulario) {
    formulario.addEventListener("submit", function(evento) {
        evento.preventDefault();

        const nombre = inputNombre.value.trim();
        const contenido = inputContenido.value.trim();
        const categoria = selectCategoria.value;

        if (!nombre || !contenido || !categoria) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const nuevaPublicacion = {
            id: Date.now(),
            usuario: nombre,
            arroba: "@" + nombre.toLowerCase().replace(/\s+/g, ""),
            tiempo: "Hace un momento",
            categoria: categoria,
            contenido: contenido,
            imagenes: [],
            likes: 0,
            avatar: "Imagenes/Link.webp"
        };

        // Agregar la nueva publicación al inicio
        publicaciones.unshift(nuevaPublicacion);

        // Mostrar todas las publicaciones
        filtroActual = "";
        mostrarPublicaciones(publicaciones);

        // Limpiar el formulario
        formulario.reset();

        // Reiniciar el contador de caracteres
        if (smallContador) {
            smallContador.textContent = "Caracteres disponibles: 300";
        }

        alert("¡Tu publicación se ha creado correctamente!");
    });
}


/* ==========================================================================
   6. FILTRAR PUBLICACIONES POR CATEGORÍA
   ========================================================================== */

const itemsGeneros = document.querySelectorAll(
    ".BarraIzq .generos li"
);

itemsGeneros.forEach(item => {
    item.style.cursor = "pointer";

    item.addEventListener("click", function() {
        filtroActual = normalizarTexto(item.textContent.trim());
        mostrarPublicaciones(obtenerPublicacionesFiltradas());
    });
    
});

// Volver a mostrar todas las publicaciones desde el menú
document.querySelectorAll(
    '.Menu.lateral a[href="#Inicio"], .Menu.lateral a[href="#publicaciones"]'
).forEach(enlace => {
    enlace.addEventListener("click", function() {
        filtroActual = "";
        mostrarPublicaciones(publicaciones);
    });
});


/* ==========================================================================
   7. CONTADOR DE CARACTERES
   ========================================================================== */

let smallContador = null;

if (inputContenido) {
    inputContenido.maxLength = 300;

    smallContador = document.createElement("small");

    smallContador.style.display = "block";
    smallContador.style.marginTop = "6px";
    smallContador.style.fontWeight = "bold";
    smallContador.style.color = "#6b7280";

    smallContador.textContent = "Caracteres disponibles: 300";

    inputContenido.parentNode.insertBefore(
        smallContador,
        inputContenido.nextSibling
    );

    inputContenido.addEventListener("input", function() {
        const restantes = 300 - inputContenido.value.length;

        smallContador.textContent =
            `Caracteres disponibles: ${restantes}`;

        smallContador.style.color =
            restantes <= 30 ? "#dc2626" : "#6b7280";
    });
}

/* ==========================================================================
   9. INICIALIZACIÓN DE LAS FUNCIONES
   ========================================================================== */

// El script tiene defer, por lo que el HTML ya está cargado.
cargarPublicacionesIniciales();
mostrarPublicaciones();
