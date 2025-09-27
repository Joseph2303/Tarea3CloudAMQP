const { publishMessage } = require('./_shared/rabbit');

exports.handler = async () => {
  try {
    await publishMessage({ entity: 'ping', ts: Date.now() });
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*'}, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('PING RABBIT ERROR:', e);
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*'}, body: JSON.stringify({ ok: false, error: e.message }) };
  }
};
