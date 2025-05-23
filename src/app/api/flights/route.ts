import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const client = createClient({
  username: 'default',
  password: 'sU3cAgmIGG5pULvmEghPOBQXCK8C8ETD',
  socket: {
    host: 'redis-13744.crce202.eu-west-3-1.ec2.redns.redis-cloud.com',
    port: 13744,
  },
});

client.on('error', (err) => console.error('Redis error:', err));

export async function GET() {
  if (!client.isOpen) {
    await client.connect();
  }

  try {
    // Get all flight data from Redis
    const keys = ['Bill', 'Trump', 'Drake', 'Kim', 'Kylie', 'Elon', 'Travis', 'Zuck', 'MichealJordan'];
    
    const flightData = {};
    
    // Fetch data for each key
    for (const key of keys) {
      const value = await client.get(key);
      if (value) {
        flightData[key] = JSON.parse(value);
      }
    }
    
    return NextResponse.json({ flightData });
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}