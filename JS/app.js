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