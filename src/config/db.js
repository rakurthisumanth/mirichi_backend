import { MongoClient } from 'mongodb';

let client;
let db;

function buildMongoOptionsFromEnv() {
  const opts = {};
  // Prefer modern 'tls' flag; driver also accepts 'ssl'
  if (process.env.MONGO_SSL !== undefined || process.env.MONGO_TLS !== undefined) {
    opts.tls = String(process.env.MONGO_SSL ?? process.env.MONGO_TLS).toLowerCase() === 'true';
  }
  if (process.env.MONGO_TLS_ALLOW_INVALID_CERT !== undefined) {
    opts.tlsAllowInvalidCertificates = String(process.env.MONGO_TLS_ALLOW_INVALID_CERT).toLowerCase() === 'true';
  }
  if (process.env.MONGO_TLS_CA_FILE) {
    opts.tlsCAFile = process.env.MONGO_TLS_CA_FILE; // absolute or relative path
  }
  if (process.env.MONGO_TLS_CERT_KEY_FILE) {
    opts.tlsCertificateKeyFile = process.env.MONGO_TLS_CERT_KEY_FILE;
  }
  if (process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) {
    const v = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS);
    if (!Number.isNaN(v)) opts.serverSelectionTimeoutMS = v;
  }
  return opts;
}

export async function connectDB(uri, dbName = process.env.DB_NAME, clientOptions = {}) {
  // Support both MONGODB_URI and MONGO_URI
  const finalUri = uri || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!finalUri) throw new Error('MONGO_URI not provided');

  client = new MongoClient(finalUri,{ ssl: true,
  tlsAllowInvalidCertificates: false, // true only if you use self-signed cert
  useNewUrlParser: true,
  useUnifiedTopology: true}
);
  await client.connect();
  // Prefer explicit DB_NAME if provided; else use DB from URI
  db = dbName ? client.db(dbName) : client.db();
  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialized. Call connectDB first.');
  return db;
}

export function getCollections() {
  const database = getDB();
  return {
    // Map app-level collection handles to the requested collection names
    users: database.collection('user_data'),
    farmers: database.collection('farmers_data'),
    customers: database.collection('customer_data'),
    buyingStockByCustomer: database.collection('buying_stock_by_customer'),
  };
}
