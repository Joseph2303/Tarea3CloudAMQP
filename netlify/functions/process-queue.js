// netlify/functions/process-queue.js
const { getDb } = require('./_shared/mongo');
const { getOnce, ack, nack } = require('./_shared/rabbit');
const { ObjectId } = require('mongodb');

async function applyMessage(db, msg) {
  const { entity, action, payload } = msg;
  const col = db.collection(entity === 'author' ? 'authors' : 'publishers');

  if (action === 'create') {
    const doc = { ...payload, createdAt: new Date() };
    await col.insertOne(doc);
    return { inserted: 1 };
  }
  if (action === 'update') {
    const { _id, ...rest } = payload;
    if (!_id) throw new Error('update requiere _id');
    const res = await col.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...rest, updatedAt: new Date() } }
    );
    return { matched: res.matchedCount, modified: res.modifiedCount };
  }
  if (action === 'delete') {
    const { _id } = payload;
    if (!_id) throw new Error('delete requiere _id');
    const res = await col.deleteOne({ _id: new ObjectId(_id) });
    return { deleted: res.deletedCount };
  }
  throw new Error(`Acción no soportada: ${action}`);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200 };
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  const maxMessages = Number(event.queryStringParameters?.max || 50);

  try {
    const db = await getDb();
    const results = [];
    let processed = 0;

    for (let i = 0; i < maxMessages; i++) {
      const msg = await getOnce();
      if (!msg) break;
      try {
        const content = JSON.parse(msg.content.toString());
        const applied = await applyMessage(db, content);
        ack(msg);
        results.push({ ok: true, content, applied });
        processed++;
      } catch (e) {
        console.error('process-queue error:', e);
        nack(msg, false, false); // descarta
        results.push({ ok: false, error: e.message });
      }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ processed, results }) };
  } catch (err) {
    console.error('process-queue fatal:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
