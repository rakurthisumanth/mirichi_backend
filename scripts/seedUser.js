import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB } from '../src/config/db.js';

async function run() {
  try {
    const db = await connectDB(
      process.env.MONGO_URI || 'mongodb://localhost:27017',
      process.env.DB_NAME || 'mirich_db'
    );
    const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || 'admin123';

  const users = db.collection('user_data');
    const existing = await users.findOne({ username });
    if (existing) {
      console.log('User already exists:', username);
    } else {
      const hash = await bcrypt.hash(password, 10);
      await users.insertOne({ username, password: hash });
      console.log('Created user:', username);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
