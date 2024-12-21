// Usar la instancia global de Socket desde socket.js
const socket = window.Socket && window.Socket.socket;
if (!socket) {
    console.error('Socket no está definido. Verifica que socket.js se haya cargado correctamente.');
}

// Escuchar eventos del servidor para actualizaciones en tiempo real
if (socket) {
    socket.on('actualizarPaneles', async () => {
        console.log('Actualización de paneles recibida.');
        try {
            await displayPanels();
        } catch (error) {
            console.error('Error al actualizar los paneles:', error);
        }
    });
} else {
    console.error('Socket no está disponible. Verifica la conexión.');
}

// Emitir eventos al servidor cuando se actualizan paneles
async function notifyPanelUpdated(panel) {
    if (socket && socket.connected) {
        socket.emit('panelActualizado', panel);
    } else {
        console.error('Socket no está conectado');
    }
}

// Obtener todos los paneles desde el backend
const fetchPanels = async () => {
    const query = `
        query {
            getPanels {
                id
                name
                description
                tasks {
                    id
                    title
                    description
                }
            }
        }
    `;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) throw new Error('Error en fetchPanels');
        const { data } = await response.json();
        return data.getPanels || [];
    } catch (error) {
        console.error('Error en fetchPanels:', error);
        return []; // Retorna un array vacío si hay errores
    }
};



// Crear un nuevo panel
async function createPanel(name, description) {
    const mutation = `
        mutation {
            createPanel(name: "${name}", description: "${description}") {
                id
                name
                description
            }
        }
    `;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation }),
        });

        const { data } = await response.json();
        return data.createPanel;
    } catch (error) {
        console.error('Error creating panel:', error);
    }
}

// Archivo: js/panel.js

// Función para abrir la alerta de confirmación y establecer el ID del panel a eliminar
function confirmDeletePanel(id) {
    // Guardamos el ID del panel en una variable global
    panelToDeleteId = id;

    // Mostrar la alerta de confirmación usando SweetAlert
    Swal.fire({
        title: '¿Eliminar este panel?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#007bff', // Color del botón de confirmación
        cancelButtonColor: '#d33',     // Color del botón de cancelación
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Llama a la función para eliminar el panel si el usuario confirma
            deletePanel();
        } else {
            // Restablecer panelToDeleteId si el usuario cancela
            panelToDeleteId = null;
        }
    });
}
async function deletePanel() {
    const mutation = `
        mutation {
            deletePanel(id: "${panelToDeleteId}") {
                id
            }
        }
    `;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: mutation }),
        });

        const result = await response.json();
        if (result.errors) {
            console.error('Error deleting panel:', result.errors);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar el panel.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Alerta de éxito después de eliminar el panel
        Swal.fire({
            title: 'Eliminado',
            text: 'El panel ha sido eliminado correctamente.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: '#28a745' // Color del botón de confirmación (verde)
        });

        // Actualizamos la visualización de paneles
        displayPanels();
    } catch (error) {
        console.error('Error deleting panel:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el panel.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } finally {
        // Restablecer el ID del panel a eliminar
        panelToDeleteId = null;
    }
}

// Mostrar paneles en la interfaz
async function displayPanels() {
    try {
        const panels = await fetchPanels(); // Obtener los paneles desde el servidor
        const container = document.getElementById('proyectosContainer');

        if (!container) {
            console.error('Contenedor de proyectos no encontrado.');
            return;
        }

        // Limpiar contenedor pero mantener los paneles estáticos
        const staticPanels = Array.from(container.querySelectorAll('.static-panel')); // Paneles estáticos existentes
        container.innerHTML = ''; // Limpiar el contenedor

        // Restaurar los paneles estáticos
        staticPanels.forEach(panel => {
            container.appendChild(panel);
        });

        if (!panels || panels.length === 0) {
            console.warn('No se encontraron paneles para mostrar.');
            return;
        }

        // Añadir los paneles dinámicos
        panels.forEach(panel => {
            const panelElement = document.createElement('div');
            panelElement.classList.add('col-lg-6', 'panel-item');
            panelElement.innerHTML = `
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">${panel.name}</h5>
                        <p class="card-text">${panel.description}</p>
                        <a href="tablero.html?panelId=${panel.id}" class="btn btn-primary">Ver Tareas</a>
                        <button class="btn btn-danger btn-sm" onclick="confirmDeletePanel('${panel.id}')">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(panelElement);
        });

        console.log(`Se han mostrado ${panels.length} panel(es) dinámico(s).`);
    } catch (error) {
        console.error('Error al mostrar los paneles:', error);
    }
}


// Crear un nuevo panel desde el modal
document.getElementById('savePanelButton').addEventListener('click', async () => {
    const name = document.getElementById('newPanelName').value;
    const description = document.getElementById('newPanelDescription').value;
    
    await createPanel(name, description);
    document.getElementById('newPanelName').value = '';
    document.getElementById('newPanelDescription').value = '';
    
    displayPanels();

    const modal = bootstrap.Modal.getInstance(document.getElementById('newPanelModal'));
    modal.hide();
});

// Asignar el evento al botón de confirmación de eliminación en el modal
document.getElementById('confirmDeleteButton').addEventListener('click', deletePanel);



// Inicializar vista de paneles
displayPanels();
