// netlify/functions/_shared/mongo.js
const { MongoClient } = require('mongodb');

let clientPromise = null;

async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'books';

  if (!uri) throw new Error('Falta MONGODB_URI en variables de entorno');
  if (!clientPromise) {
    // una sola conexión reutilizada entre invocaciones
    clientPromise = new MongoClient(uri).connect().catch((e) => {
      // si falla, limpia para permitir reintento en la próxima invocación
      clientPromise = null;
      throw e;
    });
  }

  const client = await clientPromise;   // si hubo error arriba, se va al catch del caller
  return client.db(dbName);
}

module.exports = { getDb };
