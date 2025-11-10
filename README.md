https://tarea3cloudamqp.netlify.app/

-- Es la misma URL de la Tarea 3 y 4, ya es como una continuación.

Cambios recientes: migración de MongoDB a Redis para el almacenamiento de usuarios, autores y editoriales.

Variables de entorno para Redis (ejemplo):

```
REDIS_USERNAME=default
REDIS_PASSWORD=9cIVTzWULTFcy6fsKe49D5mGNIj2Kkzs
REDIS_HOST=redis-16200.c277.us-east-1-3.ec2.redns.redis-cloud.com
REDIS_PORT=16200
```

También puedes usar `REDIS_URL` con la forma `redis://:password@host:port`.

Notas:
- Las funciones Netlify ahora usan `netlify/functions/_shared/redis.js`.
- Las colecciones se guardan como claves JSON: `authors:<id>`, `publishers:<id>`, `users:<id>` y las listas de ids en `authors:ids`, `publishers:ids`, `users:ids`.
