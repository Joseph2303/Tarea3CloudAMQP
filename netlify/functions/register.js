const { findUserByEmail, createUser } = require('./_shared/redis');
const crypto = require('crypto');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function hashPassword(password, salt) {
  const derived = crypto.scryptSync(password, salt, 64);
  return derived.toString('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    if (!event.body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body vacío' }) };
    const body = JSON.parse(event.body);
    const { email, password } = body;
    if (!email || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: 'email y password requeridos' }) };

  const existing = await findUserByEmail(email);
  if (existing) return { statusCode: 409, headers, body: JSON.stringify({ error: 'Usuario ya existe' }) };

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const doc = { email: email.toLowerCase(), passwordHash, salt };
  const id = await createUser(doc);

  return { statusCode: 201, headers, body: JSON.stringify({ id, email: doc.email }) };
  } catch (e) {
    console.error('[register] error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
