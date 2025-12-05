import mongoose from 'mongoose';
import './models/Lesson';
import './models/Course';
import './models/User';
import './models/UserProgress';
import './models/Vocabulary';
import './models/Blog';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'Japanese';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached!.promise = mongoose.connect(MONGODB_URI!, { ...opts, dbName: DB_NAME });
  }

  try {
    cached!.conn = await cached!.promise;
    const activeDbName = mongoose.connection.name;
    console.log(`✅ Connected to MongoDB Atlas (db: ${activeDbName})`);
    if (activeDbName === 'test' && process.env.NODE_ENV !== 'development') {
      throw new Error('Connected to unintended test database in non-development environment');
    }
    return cached!.conn;
  } catch (e) {
    cached!.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }
}

export default connectToDatabase;