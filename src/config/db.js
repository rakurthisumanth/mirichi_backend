import { MongoClient } from 'mongodb';

let client;
let db;

export async function connectDB(uri, dbName = process.env.DB_NAME) {
  if (!uri) throw new Error('MONGO_URI not provided');
  client = new MongoClient(uri);
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
