// netlify/functions/_shared/rabbit.js
const amqp = require('amqplib');

const QUEUE = 'book-store';
// Sugerencia: agrega heartbeat=60 para conexiones más estables
const AMQP_URL = process.env.CLOUDAMQP_URL?.includes('heartbeat=')
  ? process.env.CLOUDAMQP_URL
  : `${process.env.CLOUDAMQP_URL}?heartbeat=60`;

let _conn = null;
let _ch = null;
let _ready = null;

async function ensureChannel() {
  if (_ready) return _ready; // en progreso
  _ready = (async () => {
    try {
      if (!_conn) {
        _conn = await amqp.connect(AMQP_URL);
        _conn.on('error', (e) => {
          console.error('AMQP conn error:', e.message);
          _conn = null; _ch = null; _ready = null;
        });
        _conn.on('close', () => {
          console.error('AMQP conn closed');
          _conn = null; _ch = null; _ready = null;
        });
      }
      if (!_ch) {
        _ch = await _conn.createChannel();
        await _ch.assertQueue(QUEUE, { durable: true });
        _ch.on('error', (e) => {
          console.error('AMQP channel error:', e.message);
          _ch = null; _ready = null;
        });
        _ch.on('close', () => {
          console.error('AMQP channel closed');
          _ch = null; _ready = null;
        });
      }
      return _ch;
    } catch (e) {
      console.error('ensureChannel error:', e.message);
      _conn = null; _ch = null; _ready = null;
      throw e;
    }
  })();
  return _ready;
}

async function publishMessage(messageObj) {
  const ch = await ensureChannel();
  const content = Buffer.from(JSON.stringify(messageObj));
  const ok = ch.sendToQueue(QUEUE, content, { persistent: true });
  if (!ok) {
    // Si el buffer se llena, espera al 'drain'
    await new Promise((res) => ch.once('drain', res));
  }
  return true;
}

// Consumidor sencillo (para process-queue) con get
async function getOnce() {
  const ch = await ensureChannel();
  return ch.get(QUEUE, { noAck: false });
}

function ack(msg) {
  if (_ch && msg) _ch.ack(msg);
}
function nack(msg, allUpTo = false, requeue = false) {
  if (_ch && msg) _ch.nack(msg, allUpTo, requeue);
}

module.exports = { publishMessage, getOnce, ack, nack };
