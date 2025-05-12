import { NextResponse } from "next/server";

const artists = ['Chris Stussy','Interplanetary Criminal','Main Phase', 'Silva Bumpa-2']

export async function GET() {
    return NextResponse.json({ artists });
  
}
