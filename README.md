# Eve bonita

## Desarrollo

Instala las dependencias con `npm install` y ejecuta `npm run dev`. La aplicación
usa Firebase para guardar sus contenidos. Configura estas variables en un archivo
local `.env` con los datos de tu aplicación web de Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_CHAT_PASSWORD=
```

Reinicia Vite después de modificar el archivo. No compartas el archivo `.env`.

## Chat

El enlace **Chat** y el botón flotante abren la misma conversación compartida.
Para entrar se utiliza la contraseña configurada en `VITE_CHAT_PASSWORD`.
Cada participante elige un nombre, que se recuerda
en su navegador, y puede enviar mensajes de hasta 1000 caracteres. Se muestran
en tiempo real los 100 mensajes más recientes; los anteriores permanecen en
Firestore. El acceso se recuerda en la pestaña hasta cerrarla o pulsar
**Cerrar sesión**.

Configura `VITE_CHAT_PASSWORD` en `.env.local` y también en el entorno de
compilación del despliegue. Reinicia Vite después de cambiarla. Este bloqueo
no utiliza Firebase Authentication.

**Importante:** Vite incluye la contraseña en el código público del navegador.
Cualquier visitante puede descubrirla o evitar el bloqueo. No reutilices una
contraseña real y no consideres privada esta conversación.

El chat usa la colección `chat_mensajes` de Cloud Firestore y documentos con
`nombre` (texto, máximo 40 caracteres), `texto` (texto, máximo 1000 caracteres)
y `creado` (fecha del servidor). El bloqueo en la interfaz no cambia las reglas
de Firestore. Para que el chat funcione sin autenticación, dichas reglas deben
permitir la lectura y creación de mensajes sin iniciar sesión; esto permite a
cualquiera acceder directamente a la colección. Si los permisos no permiten el
acceso, el chat muestra un error. No modifiques las reglas de otras colecciones.

**Privacidad:** el nombre es solo una etiqueta y no verifica qué persona escribe.
No compartas información sensible.