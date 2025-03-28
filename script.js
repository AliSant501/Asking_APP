// Registrar el Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/Asking_APP/sw.js', { scope: '/Asking_APP/' })
        .then(reg => console.log('Service Worker registrado correctamente', reg))
        .catch(err => console.error('Error al registrar el Service Worker', err));
}

// Función para mostrar notificaciones
function mostrarNotificacion() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("¡Bienvenido a Mi Videojuego!", {
            body: "No olvides descargar la última versión.",
            icon: "images/icon-192.png"
        });
    }
}

// Pedir permisos para notificaciones
if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            mostrarNotificacion();
        }
    });
}

// Obtener ubicación del usuario (opcional)
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(`Latitud: ${position.coords.latitude}, Longitud: ${position.coords.longitude}`);
    });
}







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

// **IndexedDB para almacenamiento offline**
const dbName = "PuntuacionesDB";
const storeName = "puntuaciones";

// Función para abrir o crear la base de datos IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            let db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// **Guardar datos en IndexedDB**
async function saveScoresToDB(scores) {
    const db = await openDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    // Limpiar la base de datos antes de agregar nuevos datos
    store.clear();

    // Asegúrate de no agregar un "id" manualmente si estás usando autoIncrement
    scores.forEach(score => {
        // Elimina cualquier clave 'id' manual antes de añadir a IndexedDB
        const scoreWithoutId = { Usuario: score.Usuario, Puntuación: score.Puntuación };
        store.add(scoreWithoutId);
    });

    await tx.complete;  // Esperar a que la transacción termine
}

// **Obtener datos de IndexedDB**
async function getScoresFromDB() {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
    });
}


// **Mostrar puntuaciones en la tabla**
function mostrarPuntuaciones(scores) {
    const tabla = document.getElementById("tabla-puntuaciones");
    tabla.innerHTML = "<tr><th>Usuario</th><th>Puntuación</th></tr>";

    scores.forEach((data) => {
        const fila = `<tr><td>${data.Usuario}</td><td>${data.Puntuación}</td></tr>`;
        tabla.innerHTML += fila;
    });
}

// **Cargar datos desde Firebase o IndexedDB**
function cargarPuntuaciones() {
    onValue(scoresRef, async (snapshot) => {
        if (snapshot.exists()) {
            const scores = [];
            snapshot.forEach((childSnapshot) => {
                scores.push(childSnapshot.val());
            });

            // Guardar en IndexedDB para acceso offline
            await saveScoresToDB(scores);
            mostrarPuntuaciones(scores);
        }
    }, {
        onlyOnce: false // Sigue escuchando cambios en Firebase
    });

    // Si no hay conexión, obtener datos de IndexedDB
    window.addEventListener("offline", async () => {
        const localScores = await getScoresFromDB();
        mostrarPuntuaciones(localScores);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    if (!navigator.onLine) {
        // Si ya está sin conexión al cargar la página
        const localScores = await getScoresFromDB();
        mostrarPuntuaciones(localScores);
    } else {
        // Si hay conexión, cargar desde Firebase
        cargarPuntuaciones();
    }
});

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarPuntuaciones);








