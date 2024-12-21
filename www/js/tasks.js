// Usar la instancia global de Socket desde socket.js
const socket = window.Socket && window.Socket.socket;
if (!socket) {
    console.error('Socket no está definido. Verifica que socket.js se haya cargado correctamente.');
}

// Escuchar eventos del servidor para actualizaciones en tiempo real
if (socket) {
    socket.on('actualizarTablero', async (data) => {
        console.log('Actualización del tablero recibida:', data);
        if (typeof displayTasks === 'function') {
            await displayTasks(); // Refrescar las tareas en el frontend
        }
    });
} else {
    console.error('Socket no está disponible. Verifica la conexión.');
}

// Emitir eventos al servidor cuando se actualizan tareas
async function notifyTaskUpdated(task) {
    if (socket && socket.connected) {
        socket.emit('tareaActualizada', task); // Notificar a otros clientes
    } else {
        console.error('Socket no está conectado');
    }
}

// Obtener el ID del panel desde la URL
const panelId = new URLSearchParams(window.location.search).get('panelId');
if (!panelId) {
    alert("No se puede cargar el tablero porque falta el ID del panel en la URL.");
    throw new Error("El ID del panel es obligatorio.");
}

// Función para obtener todas las tareas desde el backend
async function fetchTasks() {
    const query = `
        query {
            getTasks {
                id
                title
                description
                completed
                panelId
                responsible
                createdAt
                status
                files
            }
        }
    `;
    return await window.graphqlQuery(query);
}


// Función para crear una nueva tarea
async function createTask(title, description, panelId, responsible, status) {
    const mutation = `
        mutation {
            createTask(title: "${title}", description: "${description}", panelId: "${panelId}", responsible: "${responsible}", status: "${status}") {
                id
                title
                description
                status
                completed
                responsible
                createdAt
                panelId
            }
        }
    `;
    try {
        const data = await window.graphqlQuery(mutation);
        notifyTaskUpdated(data.createTask); // Notificar al servidor
        return data.createTask;
    } catch (error) {
        console.error('Error al crear la tarea:', error);
        throw error;
    }
}

// Función para actualizar una tarea
async function updateTask(id, title, description, completed, responsible, status) {
    const mutation = `
        mutation {
            updateTask(id: "${id}", title: "${title}", description: "${description}", completed: ${completed}, responsible: "${responsible}", status: "${status}") {
                id
                title
                description
                completed
                responsible
                panelId
                status
            }
        }
    `;
    try {
        const data = await window.graphqlQuery(mutation);
        notifyTaskUpdated(data.updateTask); // Notificar al servidor
        return data.updateTask;
    } catch (error) {
        console.error('Error al actualizar la tarea:', error);
        throw error;
    }
}

// Función para eliminar una tarea
async function deleteTask(id) {
    const mutation = `
        mutation {
            deleteTask(id: "${id}") {
                id
            }
        }
    `;
    try {
        await window.graphqlQuery(mutation);
        notifyTaskUpdated({ id }); // Notificar al servidor
        await displayTasks(); // Actualizar la vista después de eliminar
        Swal.fire(
            '¡Eliminada!',
            'La tarea ha sido eliminada con éxito.',
            'success'
        );
    } catch (error) {
        console.error('Error al eliminar la tarea:', error);
        Swal.fire(
            'Error',
            'Hubo un problema al intentar eliminar la tarea.',
            'error'
        );
    }
}

// Función para mostrar las tareas en las columnas
async function displayTasks() {
    const tasks = await fetchTasks();
    const porHacerCol = document.getElementById('por_hacer');
    const enProcesoCol = document.getElementById('en_proceso');
    const finalizadoCol = document.getElementById('finalizado');

    porHacerCol.innerHTML = '';
    enProcesoCol.innerHTML = '';
    finalizadoCol.innerHTML = '';

    tasks.forEach(task => {
        if (task.panelId === panelId) {
            const taskCard = document.createElement('div');
            taskCard.classList.add('card', 'mb-3', 'draggable');
            taskCard.setAttribute('id', task.id);
            taskCard.setAttribute('draggable', 'true');
            taskCard.ondragstart = drag;

            const fileIcon = task.files && task.files.length > 0
                ? `<button class="btn btn-link p-0" onclick="openFilePopup('/uploads/${task.files[0]}')">
                    <i class="bi bi-file-earmark-text" style="font-size: 1.5rem; color: #007bff;"></i>
                   </button>`
                : '';

            taskCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text"><strong>Responsable:</strong> ${task.responsible}</p>
                    <p class="card-text"><strong>Estado:</strong> ${task.status}</p>
                    ${fileIcon}
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">Eliminar</button>
                    <button class="btn btn-primary btn-sm" onclick='openEditModal(${JSON.stringify(task)})'>Editar</button>
                    <button class="btn btn-secondary btn-sm" onclick="openAttachFileModal('${task.id}')">Adjuntar Archivo</button>
                </div>
            `;

            if (task.status === 'por_hacer') {
                porHacerCol.appendChild(taskCard);
            } else if (task.status === 'en_proceso') {
                enProcesoCol.appendChild(taskCard);
            } else if (task.status === 'finalizado') {
                finalizadoCol.appendChild(taskCard);
            }
        }
    });
}

// Llamada inicial para mostrar las tareas
window.onload = async function () {
    await displayTasks();
};


// Función para abrir el modal en modo edición
function openEditModal(task) {
    document.getElementById('newTaskTitle').value = task.title || '';
    document.getElementById('newTaskDescription').value = task.description || '';
    document.getElementById('panelId').value = task.panelId || '';
    document.getElementById('newTaskEstado').value = task.status || '';

    const saveButton = document.getElementById('saveTaskButton');
    saveButton.dataset.taskId = task.id || '';
    saveButton.textContent = "Actualizar Tarea";

    const editModal = new bootstrap.Modal(document.getElementById('newTaskModal'));
    editModal.show();
}

// Evento para guardar o actualizar una tarea
document.getElementById('saveTaskButton').addEventListener('click', async function () {
    const taskId = this.dataset.taskId;
    const title = document.getElementById('newTaskTitle').value;
    const description = document.getElementById('newTaskDescription').value;
    const responsible = document.getElementById('newTaskResponsible').value;
    const status = document.getElementById('newTaskEstado').value;

    try {
        if (taskId) {
            await updateTask(taskId, title, description, false, responsible, status);
            delete this.dataset.taskId;
            this.textContent = "Guardar";
        } else {
            await createTask(title, description, panelId, responsible, status);
        }
        await displayTasks();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        modal.hide();
    } catch (error) {
        console.error('Error al guardar la tarea:', error);
    }
});

// Definición de la función drag
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// Definición de la función drop
function allowDrop(ev) {
    ev.preventDefault();
}

async function drop(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const targetColumn = ev.target.id;

    const statusMap = {
        por_hacer: 'por_hacer',
        en_proceso: 'en_proceso',
        finalizado: 'finalizado',
    };

    const newStatus = statusMap[targetColumn];
    if (!newStatus) {
        console.error("Estado de destino no válido:", targetColumn);
        return;
    }

    const tasks = await fetchTasks();
    const updatedTask = tasks.find(t => t.id === taskId);
    if (updatedTask) {
        await updateTask(updatedTask.id, updatedTask.title, updatedTask.description, false, updatedTask.responsible, newStatus);
        displayTasks();
    }
}

// Función para abrir el modal de adjuntar archivos
function openAttachFileModal(taskId) {
    if (!taskId) {
        alert('Error: El ID de la tarea no está disponible.');
        return;
    }
    document.getElementById('attachTaskId').value = taskId; // Guardamos el ID de la tarea
    const modal = new bootstrap.Modal(document.getElementById('attachFileModal'));
    modal.show();
}

// Función para subir un archivo
async function uploadFile() {
    const taskId = document.getElementById('attachTaskId').value;
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo antes de continuar.");
        return;
    }

    try {
        const data = await window.uploadFileToServer(taskId, file);
        alert("Archivo subido con éxito.");
        await displayTasks();
    } catch (error) {
        console.error("Error al subir el archivo:", error);
    }
}

// Función para construir la URL completa de los archivos subidos
window.getFullFilePath = function(filePath) {
    // Asegúrate de que el filePath no comience con http:// o https://
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath; // La ruta ya es completa
    }

    // Asegúrate de que no se duplique "/uploads/"
    const cleanedPath = filePath.startsWith('/uploads/') ? filePath.replace('/uploads/', '') : filePath;

    // Construye la URL completa usando la base URL para uploads
    return `${window.uploadBaseUrl}/${cleanedPath}`;
};

function openFilePopup(filePath) {
    // Genera la URL completa usando el dominio y puerto del backend
    const filePathAdjusted = `${window.uploadBaseUrl}${filePath.replace('/uploads/', '')}`;

    const fileExtension = filePath.split('.').pop().toLowerCase();
    let content = '';

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
        // Mostrar imágenes
        content = `<img src="${filePathAdjusted}" alt="Archivo adjunto" style="max-width: 90%; height: auto; margin: 0 auto; display: block;">`;
    } else if (fileExtension === 'pdf') {
        // Mostrar PDF
        content = `<iframe src="${filePathAdjusted}" style="width: 100%; height: 300px;" frameborder="0"></iframe>`;
    } else if (['txt'].includes(fileExtension)) {
        // Mostrar contenido de texto
        content = `
            <div style="max-width: 100%; height: 300px; overflow-y: auto; white-space: pre-wrap; background-color: #f8f9fa; border: 1px solid #ddd; padding: 10px;">
                Cargando contenido...
            </div>
            <script>
                fetch("${filePathAdjusted}")
                    .then(response => response.text())
                    .then(text => document.querySelector('.swal2-html-container div').textContent = text)
                    .catch(error => console.error('Error al cargar el archivo de texto:', error));
            </script>
        `;
    } else {
        // Otros tipos de archivos: mostrar botón de descarga
        content = `
            <p>El archivo no se puede previsualizar. Haz clic en el botón para descargarlo:</p>
            <a href="${filePathAdjusted}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                Abrir en otra ventana
            </a>
        `;
    }

     // Botón de descarga con estilo SweetAlert
     const downloadButton = `
     <div style="margin-top: 15px; text-align: center;">
         <button onclick="forceDownload('${filePathAdjusted}')" class="btn-download custom-download-button" style="display: inline-block; margin-top: 10px;">
             Descargar automáticamente
         </button>
     </div>
 `;

 Swal.fire({
    title: 'Archivo adjunto',
    html: content + downloadButton, // Mostrar contenido y botón de descarga
    width: '50%', // Ancho del pop-up
    showCloseButton: true, // Mantener la cruz en la esquina
    showConfirmButton: false, // Eliminar el botón de confirmación "Cerrar"
    focusConfirm: false,
 });
}

// Función para forzar la descarga del archivo
function forceDownload(fileUrl) {
 const a = document.createElement('a');
 a.href = fileUrl;
 a.download = fileUrl.split('/').pop(); // Extrae el nombre del archivo
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
}
  

// Llamada inicial para mostrar las tareas
window.onload = async function () {
    await displayTasks();
};
