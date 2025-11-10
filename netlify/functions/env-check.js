// env-check: returns which important env vars are present (does NOT return values)
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  const vars = [
    'REDIS_URL', 'REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD', 'REDIS_USERNAME', 'REDIS_TLS',
    'AUTH_SECRET', 'CLOUDAMQP_URL'
  ];

  const present = {};
  for (const v of vars) {
    present[v] = Object.prototype.hasOwnProperty.call(process.env, v);
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true, present }) };
};
