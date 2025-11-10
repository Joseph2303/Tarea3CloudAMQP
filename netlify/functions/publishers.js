// netlify/functions/publishers.js
const { listEntities } = require('./_shared/redis');
const { publishMessage } = require('./_shared/rabbit');

exports.handler = async (event) => {
  // CORS / preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    // GET: lista directa desde Redis
    if (event.httpMethod === 'GET') {
      const data = await listEntities('publishers');
      data.sort((a,b) => (b.createdAt || '') > (a.createdAt || '') ? 1 : -1);
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // Parseo seguro del body
    let body = {};
    if (!event.body) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body vacío' }) };
    }
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      console.error('[publishers] JSON parse error:', e.message, 'raw:', event.body);
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON inválido' }) };
    }

    // Mapeo de acciones diferidas
    const actionMap = { POST: 'create', PUT: 'update', DELETE: 'delete' };
    const action = actionMap[event.httpMethod];
    if (!action) {
      return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // Validaciones mínimas
    if (action !== 'delete' && !body.name) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'name es requerido' }) };
    }

    // Publicar operación en la cola
    try {
      await publishMessage({
        entity: 'publisher',
        action,
        payload: body,
        ts: Date.now(),
      });
    } catch (e) {
      console.error('[publishers] publishMessage error:', e);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Error publicando en la cola', detail: e.message }),
      };
    }

    // Aceptado (encolado)
    return { statusCode: 202, headers, body: JSON.stringify({ queued: true, action }) };
  } catch (err) {
    console.error('[publishers] fatal:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
