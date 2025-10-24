import 'dotenv/config';
import http from 'http';
import { connectDB, getCollections } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 3003;

async function start() {
  try {
    const db = await connectDB(
      process.env.MONGO_URI || 'mongodb://localhost:27017',
      process.env.DB_NAME || 'mirich_db'
    );
    // Attach db and commonly used collections
    app.locals.db = db;
  const { users, farmers, customers, buyingStockByCustomer } = getCollections();
    app.locals.users = users;
    app.locals.farmers = farmers;
    app.locals.customers = customers;
  app.locals.buyingStockByCustomer = buyingStockByCustomer;
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
