const { getClient } = require('./_shared/redis');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    const c = await getClient();
    // ping may throw if connection fails
    const pong = await c.ping();
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, pong }) };
  } catch (err) {
    console.error('[redis-ping] error:', err && err.message ? err.message : err);
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err) }) };
  }
};
