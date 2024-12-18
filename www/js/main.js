// Función que alterna la visibilidad del menú lateral (sidebar)
// Cuando el usuario hace clic en el botón con el id "menu-toggle", se activa el siguiente código
document.getElementById("menu-toggle").addEventListener("click", function () {
    // Añade o quita la clase "toggled" al contenedor con el id "wrapper"
    // Esto controla si el menú lateral está visible o no
    document.getElementById("wrapper").classList.toggle("toggled");
});
