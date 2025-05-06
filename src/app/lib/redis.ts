// lib/redis.ts
import { createClient } from 'redis';

// Create a singleton instance
let client: ReturnType<typeof createClient> | null = null;
let isConnected = false;

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: 'redis://default:B7EcCOTYVtAlzIW60B3oqZ4C5Z3FfEZf@redis-16786.c339.eu-west-3-1.ec2.redns.redis-cloud.com:16786',
    });

    client.on('error', (err) => {
      console.error('Redis Client Error', err);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('Redis client connected');
      isConnected = true;
    });

    client.on('end', () => {
      console.log('Redis client disconnected');
      isConnected = false;
    });
  }

  // Ensure client is connected before returning
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      throw err;
    }
  }

  return client;
}