# PRODUCTO 3 _ Proyecto de Gestión de Tareas (To-Do List)

Este proyecto es una aplicación web para gestionar tareas, donde los usuarios pueden crear, editar, eliminar y organizar tareas en diferentes columnas. Se utiliza GraphQL para la comunicación con el backend, lo que permite realizar consultas y mutaciones de manera eficiente.

## Tecnologías Utilizadas

- **HTML**: Para la estructura de la interfaz de usuario.
- **CSS**: Para el diseño y estilo de la aplicación.
- **JavaScript**: Para la lógica de la aplicación y la interacción con el usuario.
- **Bootstrap**: Para un diseño responsivo y estilizado.
- **GraphQL**: Para gestionar las operaciones de CRUD (Crear, Leer, Actualizar, Eliminar) en las tareas.

## Funcionalidades Implementadas

1. **Visualización de Tareas**: 
   - La aplicación muestra todas las tareas divididas en tres columnas:
     - Por Hacer
     - En Proceso
     - Finalizado

2. **Creación de Tareas**:
   - Los usuarios pueden agregar nuevas tareas mediante un modal que recoge el título, descripción y panel correspondiente.
   - Al guardar, la tarea se crea y se muestra en la columna correspondiente.

3. **Edición de Tareas**:
   - Cada tarea tiene un botón de "Editar" que permite al usuario modificar el título y la descripción de la tarea seleccionada.
   - Los cambios se guardan en el backend y se actualiza la visualización.

4. **Eliminación de Tareas**:
   - Las tareas pueden ser eliminadas, lo que actualiza automáticamente la visualización en la interfaz.

5. **Arrastrar y Soltar**:
   - Las tareas pueden ser arrastradas y soltadas entre las columnas, actualizando su estado automáticamente en el backend.

## Estructura del Proyecto

- **index.html**: Archivo principal que contiene la estructura HTML de la aplicación.
- **css/style.css**: Estilos personalizados para la aplicación.
- **js/tasks.js**: Lógica de la aplicación, incluyendo la gestión de tareas mediante GraphQL.
- **modal.html**: Estructura del modal utilizado para crear y editar tareas.

## Instrucciones para Ejecutar el Proyecto

1. **Instalación de Dependencias**: Asegúrate de tener un servidor GraphQL en funcionamiento en `http://localhost:4000/graphql`. Puedes usar Apollo Server, Express GraphQL u otro.

         ├── @graphql-tools/merge@9.0.8
         ├── @graphql-tools/schema@10.0.7
         ├── apollo-server-express@3.13.0
         ├── cors@2.8.5
         ├── dotenv@16.4.7
         ├── express@4.21.1
         ├── graphql@15.9.0
         ├── mongodb@6.10.0
         ├── mongoose@7.8.3
         ├── multer@1.4.5-lts.1
         └── nodemon@3.1.7
   
2. **Abrir el Proyecto**: Abre el archivo `index.html` en un navegador web.

3. **Interacción**:
   - **Agregar Tareas**: Haz clic en el botón para abrir el modal, completa los campos y guarda.
   - **Editar Tareas**: Haz clic en el botón "Editar" en la tarea que deseas modificar, actualiza los campos y guarda los cambios.
   - **Eliminar Tareas**: Haz clic en el botón "Eliminar" para eliminar una tarea.
   - **Mover Tareas**: Arrastra las tareas entre las columnas para actualizar su estado.

## Futuras Mejoras

- Añadir autenticación de usuarios para que cada usuario tenga su propia lista de tareas.
- Implementar un sistema de filtrado y búsqueda de tareas.
- Mejorar la interfaz de usuario con más funcionalidades de Bootstrap.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar este proyecto, por favor, abre un issue o un pull request en el repositorio.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.
