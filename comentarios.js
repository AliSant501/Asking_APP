import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyALfC-owJNDU2PlkLG7zRwbgw_MI8EsADs",
    authDomain: "asking-ffe15.firebaseapp.com",
    databaseURL: "https://asking-ffe15-default-rtdb.firebaseio.com",
    projectId: "asking-ffe15",
    storageBucket: "asking-ffe15.appspot.com",
    messagingSenderId: "963542333547",
    appId: "1:963542333547:web:fb63d102ef5f4df28e192e",
    measurementId: "G-2SD26RJ499"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const scoresRef = ref(database, "scores");


const form = document.getElementById("comentarioForm");
const estrellas = document.querySelectorAll(".estrella");
let calificacion = 0;

// Estrellas seleccionadas
estrellas.forEach(estrella => {
    estrella.addEventListener("click", () => {
        calificacion = parseInt(estrella.dataset.valor);
        document.getElementById("calificacion").value = calificacion;
        estrellas.forEach(e => e.classList.remove("seleccionada"));
        for (let i = 0; i < calificacion; i++) {
            estrellas[i].classList.add("seleccionada");
        }
    });
});

// Guardar comentario
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const opinion = document.getElementById("opinion").value;

    const comentario = { usuario, opinion, calificacion, fecha: new Date().toISOString() };

    try {
        await addDoc(collection(db, "comentarios"), comentario);
        mostrarComentario(comentario);
        form.reset();
        estrellas.forEach(e => e.classList.remove("seleccionada"));
    } catch (err) {
        console.error("Error al guardar comentario:", err);
    }
});

// Mostrar comentarios
async function cargarComentarios() {
    try {
        const querySnapshot = await getDocs(collection(db, "comentarios"));
        querySnapshot.forEach(doc => {
            mostrarComentario(doc.data());
        });
    } catch (error) {
        console.log("Modo offline o error al cargar:", error);
    }
}

function mostrarComentario(data) {
    const contenedor = document.getElementById("lista-comentarios");
    const div = document.createElement("div");
    div.innerHTML = `
        <strong>${data.usuario}</strong> (${data.calificacion} ★)<br>
        <p>${data.opinion}</p><hr>
    `;
    contenedor.prepend(div);
}



window.onload = cargarComentarios;
