const { createClient } = require('redis');

let client = null;

async function getClient() {
  if (client) return client;
  const username = process.env.REDIS_USERNAME || process.env.REDIS_USER || undefined;
  const password = process.env.REDIS_PASSWORD || process.env.REDIS_PASS || undefined;
  const host = process.env.REDIS_HOST || process.env.REDIS_HOSTNAME || undefined;
  const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined;

  const opts = {};
  if (username) opts.username = username;
  if (password) opts.password = password;
  opts.socket = {};
  if (host) opts.socket.host = host;
  if (port) opts.socket.port = port;

  // If CLOUD_REDIS_URL provided, use it
  if (process.env.REDIS_URL) {
    client = createClient({ url: process.env.REDIS_URL });
  } else {
    client = createClient(opts);
  }

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
    client = null;
  });

  await client.connect();
  return client;
}

// Helpers for simple document storage using JSON strings and an id list
async function listEntities(entity) {
  const c = await getClient();
  const ids = await c.lRange(`${entity}:ids`, 0, -1);
  const res = [];
  for (const id of ids) {
    const raw = await c.get(`${entity}:${id}`);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        res.push({ ...obj, _id: id });
      } catch (e) {
        console.error('listEntities parse error', e);
      }
    }
  }
  return res;
}

async function createEntity(entity, payload) {
  const c = await getClient();
  const id = await c.incr(`${entity}:nextId`);
  const doc = { ...payload, createdAt: new Date().toISOString() };
  await c.set(`${entity}:${id}`, JSON.stringify(doc));
  await c.rPush(`${entity}:ids`, String(id));
  return String(id);
}

async function updateEntity(entity, id, payload) {
  const c = await getClient();
  const raw = await c.get(`${entity}:${id}`);
  if (!raw) return { matched: 0, modified: 0 };
  const doc = JSON.parse(raw);
  const updated = { ...doc, ...payload, updatedAt: new Date().toISOString() };
  await c.set(`${entity}:${id}`, JSON.stringify(updated));
  return { matched: 1, modified: 1 };
}

async function deleteEntity(entity, id) {
  const c = await getClient();
  const res = await c.del(`${entity}:${id}`);
  await c.lRem(`${entity}:ids`, 0, String(id));
  return res; // number of keys removed
}

// Users helpers
async function findUserByEmail(email) {
  const c = await getClient();
  const id = await c.get(`users:byemail:${email.toLowerCase()}`);
  if (!id) return null;
  const raw = await c.get(`users:${id}`);
  if (!raw) return null;
  const obj = JSON.parse(raw);
  return { ...obj, _id: id };
}

async function createUser(user) {
  const c = await getClient();
  const id = await c.incr('users:nextId');
  const doc = { ...user, createdAt: new Date().toISOString() };
  await c.set(`users:${id}`, JSON.stringify(doc));
  await c.set(`users:byemail:${user.email.toLowerCase()}`, String(id));
  await c.rPush('users:ids', String(id));
  return String(id);
}

module.exports = {
  getClient,
  listEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  findUserByEmail,
  createUser,
};
