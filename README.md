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
y `creado` (fecha del servidor). Cada mensaje puede tener `respuestaA`
(`{ id, nombre, texto }`, el mensaje exacto al que responde) y `reacciones`
(mapa de emoji a lista de nombres). Al editar un mensaje se actualiza `texto`
y se añade `editado` (fecha del servidor). Un mensaje con foto lleva `imagen`
y una nota de voz lleva `audio` (URL de descarga de Storage); en ambos casos
`texto` puede ir vacío. Los archivos se suben a la carpeta `chat/` de Firebase
Storage, así que sus reglas deben permitir escribir, leer y borrar ahí. Cada
persona puede borrar sus mensajes, lo que requiere permiso de **borrado** en
`chat_mensajes`. La colección `chat_estado` guarda un documento por nombre con
`escribiendo` (milisegundos del último tecleo) y `visto` (milisegundos del
último mensaje leído); sin permiso de lectura y escritura ahí, el chat sigue
funcionando pero sin "escribiendo…" ni doble check. Las reacciones se guardan con
`arrayUnion`/`arrayRemove`, así que las reglas de Firestore deben permitir
también la **actualización** de `chat_mensajes`. El bloqueo en la interfaz no cambia las reglas
de Firestore. Para que el chat funcione sin autenticación, dichas reglas deben
permitir la lectura y creación de mensajes sin iniciar sesión; esto permite a
cualquiera acceder directamente a la colección. Si los permisos no permiten el
acceso, el chat muestra un error. No modifiques las reglas de otras colecciones.

El horario de cada uno (sección Planes) se guarda en la colección `horarios`,
documentos `ivan` y `cheva`, campo `horas` (lista de `"AAAA-MM-DDTHH:00"`
ocupadas). Sin permiso de lectura y escritura ahí, cada horario queda solo en
el navegador donde se marcó y la otra persona no lo ve.

**Privacidad:** el nombre es solo una etiqueta y no verifica qué persona escribe.
No compartas información sensible.