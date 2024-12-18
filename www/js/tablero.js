// Obtener el ID del panel desde la URL
const panelId = new URLSearchParams(window.location.search).get('panelId');

if (!panelId) {
    console.error("Error: 'panelId' no está definido en la URL.");
    alert("No se puede cargar el tablero porque falta el ID del panel en la URL.");
    throw new Error("El ID del panel es obligatorio.");
}

// Función para mostrar el título del panel
async function setPanelTitle() {
    const query = `
        query {
            getPanel(id: "${panelId}") {
                name
            }
        }
    `;
    try {
        const data = await window.graphqlQuery(query);
        document.getElementById('panelTitle').innerText = `Tablero - ${data.getPanel.name}`;
    } catch (error) {
        console.error('Error al obtener el título del panel:', error);
    }
}

/* Inicializar el tablero con tareas
async function displayTasks() {
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
            }
        }
    `;
    try {
        const data = await window.graphqlQuery(query);
        const tasks = data.getTasks;

        const porHacerCol = document.getElementById('porHacer');
        const enProcesoCol = document.getElementById('enProceso');
        const finalizadoCol = document.getElementById('finalizado');

        // Limpiar las columnas
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

                // Construir contenido HTML de la tarjeta
                let fileThumbnail = '';
                if (task.files && task.files.length > 0) {
                    const fileUrl = `${window.apiUrl.replace('/graphql', '')}/uploads/${task.files[0]}`;
                    fileThumbnail = `
                        <div class="mt-2">
                            <img src="${fileUrl}" alt="Archivo adjunto" class="img-thumbnail" style="width: 100px; height: 100px; object-fit: cover;">
                        </div>
                    `;
                }

                taskCard.innerHTML = `
                    <div class="card-body">
                        <h5 class="card-title">${task.title}</h5>
                        <p class="card-text">${task.description}</p>
                        <p class="card-text"><strong>Responsable:</strong> ${task.responsible}</p>
                        <p class="card-text"><strong>Creado el:</strong> ${new Date(task.createdAt).toLocaleDateString()}</p>
                        ${fileThumbnail}
                        <button class="btn btn-danger btn-sm mt-2" onclick="deleteTask('${task.id}')">Eliminar</button>
                        <button class="btn btn-primary btn-sm mt-2" onclick='openEditModal(${JSON.stringify(task)})'>Editar</button>
                    </div>
                `;

                // Añadir a la columna correspondiente
                if (task.completed) {
                    finalizadoCol.appendChild(taskCard);
                } else if (task.status === 'en_proceso') {
                    enProcesoCol.appendChild(taskCard);
                } else {
                    porHacerCol.appendChild(taskCard);
                }
            }
        });
    } catch (error) {
        console.error('Error al mostrar las tareas:', error);
    }
}*/

// Función para abrir el modal en modo edición
function openEditModal(task) {
    document.getElementById('newTaskTitle').value = task.title || '';
    document.getElementById('newTaskDescription').value = task.description || '';
    document.getElementById('newTaskResponsible').value = task.responsible || '';
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
            const mutation = `
                mutation {
                    updateTask(
                        id: "${taskId}",
                        title: "${title}",
                        description: "${description}",
                        responsible: "${responsible}",
                        status: "${status}"
                    ) {
                        id
                    }
                }
            `;
            await window.graphqlQuery(mutation);
        } else {
            const mutation = `
                mutation {
                    createTask(
                        title: "${title}",
                        description: "${description}",
                        panelId: "${panelId}",
                        responsible: "${responsible}",
                        status: "${status}"
                    ) {
                        id
                    }
                }
            `;
            await window.graphqlQuery(mutation);
        }
        delete this.dataset.taskId;
        this.textContent = "Guardar";
        await displayTasks();
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTaskModal'));
        modal.hide();
    } catch (error) {
        console.error('Error al guardar la tarea:', error);
    }
});

// Funciones Drag and Drop
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

async function drop(ev) {
    ev.preventDefault();
    const taskId = ev.dataTransfer.getData("text");
    const targetColumn = ev.target.id;

    const statusMap = {
        porHacer: 'por_hacer',
        enProceso: 'en_proceso',
        finalizado: 'finalizado',
    };

    const newStatus = statusMap[targetColumn];
    if (!newStatus) return;

    const mutation = `
        mutation {
            updateTask(
                id: "${taskId}",
                status: "${newStatus}"
            ) {
                id
            }
        }
    `;
    try {
        await window.graphqlQuery(mutation);
        await displayTasks();
    } catch (error) {
        console.error('Error al mover la tarea:', error);
    }
}

// Llamada inicial para mostrar las tareas y establecer el título del panel
window.onload = async function () {
    try {
        await setPanelTitle();
        await displayTasks();
    } catch (error) {
        console.error('Error durante la inicialización:', error);
    }
};
