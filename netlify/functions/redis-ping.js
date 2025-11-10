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
    // Build a small diagnostics object (do not include secrets)
    const connectionInfo = {
      hasRedisUrl: !!process.env.REDIS_URL || !!process.env.REDIS_TLS_URL,
      redisHost: process.env.REDIS_HOST || null,
      redisPort: process.env.REDIS_PORT || null,
      redisTls: (process.env.REDIS_TLS || '').toLowerCase() === 'true',
    };

    const c = await getClient();
    // ping may throw if connection fails
    const pong = await c.ping();
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, pong, connectionInfo }) };
  } catch (err) {
    console.error('[redis-ping] error:', err && err.message ? err.message : err);
    const connectionInfo = {
      hasRedisUrl: !!process.env.REDIS_URL || !!process.env.REDIS_TLS_URL,
      redisHost: process.env.REDIS_HOST || null,
      redisPort: process.env.REDIS_PORT || null,
      redisTls: (process.env.REDIS_TLS || '').toLowerCase() === 'true',
    };
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: String(err && err.message ? err.message : err), connectionInfo }) };
  }
};
