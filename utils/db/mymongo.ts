import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string; // your mongodb connection string
const options = {
  family: 4,
  connectTimeoutMS: 60000,
  serverSelectionTimeoutMS: 60000,
  maxIdleTimeMS: 60000,
};

declare global {
  var _mongoClientPromise2: Promise<MongoClient>;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

// Initialize client outside try-catch
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const initializeClient = () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      if (!global._mongoClientPromise2) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise2 = client.connect();
      }
      return global._mongoClientPromise2;
    } else {
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri, options);
      return client.connect();
    }
  } catch (error) {
    console.error(`MongoDB connection error:`, error);
    throw error;
  }
};

// Initialize the client promise
clientPromise = initializeClient();

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;