// app/api/redis/route.ts
import { NextResponse } from "next/server";
import { getRedisClient } from "../../lib/redis";

export async function GET() {
  try {
    const client = await getRedisClient();
    const data = await client.get("analysis_results");
    return NextResponse.json(data ? JSON.parse(data) : []);
  } catch (err) {
    console.error("Redis fetch error:", err);
    return new NextResponse("Failed to load tracks", { status: 500 });
  }
}
 