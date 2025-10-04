# Bookstore - Tarea 3

Este repositorio contiene una versión del Bookstore con autenticación mínima usando funciones de Netlify y MongoDB.

Archivos importantes:
- `netlify/functions/register.js` - endpoint para registrar usuarios (guarda email, hash y salt en `users`).
- `netlify/functions/login.js` - endpoint para login; devuelve un token HMAC simple.
- `frontend/src/components/Login.vue` - pantalla de login/registro.
- `frontend/src/api.js` - añade llamadas `register` y `login` y adjunta token en encabezados.

Variables de entorno necesarias (Netlify):
- `MONGODB_URI` - cadena de conexión a MongoDB (ej: Mongo Atlas)
- `DB_NAME` - nombre de la base de datos (opcional; por defecto `books`)
- `CLOUDAMQP_URL` - URL de CloudAMQP (opcional, si usas rabbit)
- `AUTH_SECRET` - secreto para firmar tokens (cambia en producción)

Despliegue en Netlify (resumen):
1. Crear nuevo sitio en Netlify vinculando este repositorio.
2. En Settings > Build & deploy > Environment, agregar las variables de entorno listadas arriba.
3. Build command (para frontend dentro de `frontend`): `npm run build` o usar la configuración por defecto si se usa `netlify.toml`.

Nota: No subir `node_modules`. Subir sólo el código fuente.

URL pública: agrega aquí la dirección donde publiques el sitio.
https://tarea3cloudamqp.netlify.app/