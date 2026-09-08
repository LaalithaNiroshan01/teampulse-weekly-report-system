const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongoServer;

/**
 * Connect to MongoDB with fallback strategy:
 * 1. If running automated tests (NODE_ENV=test), boot an isolated in-memory DB.
 * 2. If MONGODB_URI is provided (e.g. MongoDB Atlas), connect directly to it.
 * 3. If running locally without MONGODB_URI, persist data in local .data/mongodb via mongodb-memory-server.
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  let uri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === 'test') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
  } else if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI must be configured in production environment');
    }

    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.resolve(process.env.LOCAL_DB_PATH || path.join(__dirname, '../../.data/mongodb'));
    
    // Ensure directory exists
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
        dbName: 'teampulse'
      }
    });

    uri = mongoServer.getUri('teampulse');
    console.log('[Database] Local persistent database active in .data/mongodb');
  }

  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000
  });
}

/**
 * Cleanly close connections on shutdown or after tests
 */
async function disconnectDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

module.exports = { connectDB, disconnectDB };
