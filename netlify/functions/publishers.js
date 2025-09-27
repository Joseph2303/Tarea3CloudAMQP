// netlify/functions/publishers.js
const { getDb } = require('./_shared/mongo');
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
    const db = await getDb();
    const col = db.collection('publishers');

    // GET: lista directa desde BD
    if (event.httpMethod === 'GET') {
      const data = await col.find({}).sort({ _id: -1 }).toArray();
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
