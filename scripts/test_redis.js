const fs = require('fs');
const path = require('path');
const { createClient } = require('redis');

// Load .env manually (no dependency on dotenv)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx > 0) {
      const key = line.substring(0, idx);
      let val = line.substring(idx + 1);
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

(async () => {
  const envUrl = process.env.REDIS_URL;
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined;
  const useTls = (process.env.REDIS_TLS || '').toLowerCase() === 'true';

  const opts = {};
  if (envUrl) opts.url = envUrl;
  else {
    // If TLS explicitly requested, prefer a URL
    if (useTls && host) {
      const auth = username ? `${encodeURIComponent(username)}:${encodeURIComponent(password)}` : `:${encodeURIComponent(password)}`;
      opts.url = `rediss://${auth}@${host}${port ? `:${port}` : ''}`;
    } else {
      opts.socket = { connectTimeout: 5000 };
      if (host) opts.socket.host = host;
      if (port) opts.socket.port = port;
      if (username) opts.username = username;
      if (password) opts.password = password;
    }
  }
  opts.socket = opts.socket || { connectTimeout: 5000 };

  console.log('Using connection options:', JSON.stringify(opts));
  const client = createClient(opts);
  client.on('error', (err) => console.error('Redis client error event:', err && err.message ? err.message : err));

  try {
    console.log('Connecting to Redis...');
    await client.connect();
    const pong = await client.ping();
    console.log('PING ->', pong);

    const seed = process.env.SKIP_SEED === '1' ? false : true;
    if (seed) {
      console.log('Seeding test user...');
      const id = await client.incr('users:nextId');
      const doc = { email: 'seed@example.com', passwordHash: 'seed', salt: 's', createdAt: new Date().toISOString() };
      await client.set(`users:${id}`, JSON.stringify(doc));
      await client.set(`users:byemail:${doc.email}`, String(id));
      await client.rPush('users:ids', String(id));
      console.log('Seeded user id', id);
    } else {
      console.log('Skipping seed (SKIP_SEED=1)');
    }

    await client.quit();
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Connection/operation failed:', err && err.message ? err.message : err);
    try { await client.quit(); } catch (_) {}
    process.exit(1);
  }
})();
