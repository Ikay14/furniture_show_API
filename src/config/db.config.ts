import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

import { createClient } from 'redis';

dotenv.config();

// MongoDB connection
export async function initializeDatabase() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:10000/suxch';
    await mongoose.connect(dbUri, {
    });
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1); 
  }
}  

// Redis Connection
export const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'), 
    }
});

client.on('error', err => console.log('Redis Client Error', err));

export const connectRedis = async () => {
  if(!client.isOpen) { 
     try {
    await client.connect();
    console.log('Connected to Redis');
    
    // Test Redis connection
    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log('Test value from Redis:', result);
  } catch (err) {
    console.error('Error connecting to Redis:', err);
    throw err;
}
  }
}