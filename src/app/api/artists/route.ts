import { NextResponse } from "next/server";

const artists = ['Chris Stussy','Interplanetary Criminal']

export async function GET() {
    return NextResponse.json({ artists });
  
}
