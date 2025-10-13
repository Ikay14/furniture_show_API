import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

// MongoDB connection
export async function initializeDatabase() {
  try {
    const dbUri = process.env.MONGO_URI || 'mongodb://localhost:10000/shopFurYou'
    await mongoose.connect(dbUri);
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed', error)
    process.exit(1);
  }
}

// Redis Connection
export const client = createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '10364'),
    // tls: true, // Redis Cloud requires TLS
    reconnectStrategy: (retries) => {
      console.log(`Reconnecting to Redis: attempt #${retries}`)
      return Math.min(retries * 100, 3000);
    },
  },
})

export const CACHE_TTL = 60 * 5; // 5 minutes

// Keep-alive ping
setInterval(async () => {
  try {
    await client.ping()
    console.log('Redis ping OK')
  } catch (err) {
    console.error('Redis ping failed:', err)
  }
}, 30000)

client.on('error', (err) => console.error('Redis Client Error', err))
client.on('connect', () => console.log('Redis Connected'))
client.on('reconnecting', () => console.log('🔄 Redis reconnecting...'))
client.on('end', () => console.warn('Redis connection closed'))

export const connectRedis = async () => {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log('Connected to Redis')
    } catch (err) {
      console.error('Error connecting to Redis:', err)
      throw err
    }
  }
}
