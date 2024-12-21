// Configuración global para la API
window.apiUrl = 'http://localhost:4000/graphql'; // Endpoint principal de GraphQL
window.uploadBaseUrl = 'http://localhost:4000'; // Base URL para archivos subidos

// Función genérica para realizar consultas (queries) GraphQL
window.graphqlQuery = async function(query, variables = {}) {
    try {
        const response = await fetch(window.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
            throw new Error(`Error en la consulta GraphQL: ${response.status} ${response.statusText}`);
        }

        const { data, errors } = await response.json();
        if (errors) {
            console.error('Errores en la consulta GraphQL:', errors);
            throw new Error('Hubo errores en la consulta.');
        }

        return data;
    } catch (error) {
        console.error('Error al ejecutar la consulta GraphQL:', error);
        throw error;
    }
};

// Función para manejar subidas de archivos
window.uploadFileToServer = async function(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Construye la URL del endpoint de subida de archivos
        const uploadEndpoint = `${window.apiUrl.replace('/graphql', '')}/upload/${taskId}`;
        const response = await fetch(uploadEndpoint, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Error en la subida:', errorData);
            throw new Error(`Error al subir el archivo: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        throw error;
    }
};

// Función para construir la URL completa de los archivos subidos
window.getFullFilePath = function(filePath) {
    // Asegúrate de que el filePath no comience con http:// o https://
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    // Construye la URL completa usando la base URL para uploads
    return `${window.uploadBaseUrl}${filePath}`;
};