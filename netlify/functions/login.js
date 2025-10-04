const { getDb } = require('./_shared/mongo');
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

function signToken(payload) {
  // token simple: base64(payload).hmac
  const secret = process.env.AUTH_SECRET || 'dev_secret_change_me';
  const payloadStr = JSON.stringify(payload);
  const b = Buffer.from(payloadStr).toString('base64');
  const sig = crypto.createHmac('sha256', secret).update(b).digest('hex');
  return `${b}.${sig}`;
}

function verifyToken(token) {
  const secret = process.env.AUTH_SECRET || 'dev_secret_change_me';
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(b).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const payload = JSON.parse(Buffer.from(b, 'base64').toString('utf8'));
    return payload;
  } catch (e) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    if (!event.body) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body vacío' }) };
    const body = JSON.parse(event.body);
    const { email, password } = body;
    if (!email || !password) return { statusCode: 400, headers, body: JSON.stringify({ error: 'email y password requeridos' }) };

    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Credenciales inválidas' }) };

    const candidate = hashPassword(password, user.salt);
    if (candidate !== user.passwordHash) return { statusCode: 401, headers, body: JSON.stringify({ error: 'Credenciales inválidas' }) };

    const token = signToken({ sub: user._id.toString(), email: user.email, iat: Date.now() });
    return { statusCode: 200, headers, body: JSON.stringify({ token }) };
  } catch (e) {
    console.error('[login] error:', e);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
