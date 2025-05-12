import { NextResponse } from "next/server";

const artists = ['Chris Stussy','Interplanetary Criminal','Main Phase', 'Silva Bumpa-2', 'Kettama', 'Malugi', 'Effy', 'Mall Grab','Bakey','Eloq','Diffrent','Osmosis Jones','4am Kru','Samurai Breaks','Prozak-2','Soul Mass Transit System','Oppidan']

export async function GET() {
    return NextResponse.json({ artists });
  
}
