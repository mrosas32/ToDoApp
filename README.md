# To Do EV2 #

Este proyecto corresponde a la evaluación de la unidad 2 de Desarrollo de Aplicaciones Móviles.
# Funcionalidades #

Implementé las siguientes características solicitadas en la evaluación:

- Gestión de Tareas: Se pueden agregar, editar, eliminar y listar tareas.
- Almacenamiento: Usé Capacitor Preferences para guardar los datos en el equipo y que no se borren al cerrar la app.
- Cámara: Integre el uso de la cámara nativa para poder sacar fotos y adjuntarlas a la tarea.
- GPS: Agregué la función de geolocalización para registrar las coordenadas al momento de crear una tarea.
- Usuarios: Realicé un sistema de login y registro que permite que distintos usuarios tengan sus propias listas de tareas privadas.
- Conexión API: Programé la capacidad de subir las tareas a un servicio web y también descargar tareas desde una fuente externa.

# Estructura del Código #

Para optimizar el proyecto, organicé el código separando la lógica de la vista:

- Hooks: Moví la lógica de la cámara y la gestión de datos a archivos separados para limpiar el componente principal.
- Services: Creé un archivo dedicado para manejar las peticiones a la API externa.
- Context: Implementé un contexto para manejar la sesión del usuario en toda la aplicación.

# Instalación y Ejecución #

1. Descargar el proyecto e instalar las dependencias:
   npm install
2. Ejecutar la versión web para desarrollo:
   ionic serve
3. Correr las pruebas unitarias de los periféricos:
   npm test

# Compilación Android #

1. Generar la carpeta de distribución:
   npm run build
2. Sincronizar con el proyecto nativo:
   npx cap sync
3. Abrir el proyecto en Android Studio para generar el APK:
   npx cap open android