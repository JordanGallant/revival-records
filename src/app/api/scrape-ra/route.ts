import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface Event {
  title: string;
  date: string;
}

interface ApiResponse {
  events?: Event[];
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { artistName } = body; //get converted artsit name from client

    if (!artistName) {
      return NextResponse.json({ error: "Artist name is required" } as ApiResponse, { status: 400 });
    }

    const res = await fetch(`https://ra.co/dj/${artistName}/tour-dates`, { //scrape RA
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      console.error(`Error fetching artist page: ${res.status} ${res.statusText}`);
      return NextResponse.json({
        error: `Failed to fetch artist data: ${res.statusText}`
      } as ApiResponse, { status: res.status });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let eventData: any = null;
    if (!eventData) {
      const events: Event[] = [];

      $("script").each((_, el) => {
        const scriptContent = $(el).html();

        if (scriptContent && scriptContent.includes('"__typename":"Event"')) {
          try {

            const startIndex = scriptContent.indexOf('"urlName"'); //gets urlName -> currrent location (starting point)
            if (startIndex !== -1) {
              const filteredContent = scriptContent.slice(startIndex);
              const imageUrlMatches = [...filteredContent.matchAll(/"filename":"(https?:\/\/[^"]+)"/g)]; //finds all image urls
              const imageUrls = imageUrlMatches.map(match => match[1]);

              //skips first urlName -> actual location
              const secondIndex = scriptContent.indexOf('"urlName"', startIndex + 1);
              const contentAfterSecond = scriptContent.slice(secondIndex);

              const areaMatches = [...contentAfterSecond.matchAll(/"urlName":"(.*?)"/g)]; //getts all area names
              const urlNames = areaMatches.map(m => m[1]);






              const eventMatches = filteredContent.match(/({[^}]*?"__typename":"Event"[^}]*})/g);
              let index = 0
              if (eventMatches) {
                for (const match of eventMatches) {
                  const titleMatch = match.match(/"title":"(.*?)"/);
                  const dateMatch = match.match(/"date":"(.*?)"/);
                  const imageUrl = imageUrls[index]
                  const area = urlNames[index]
                  console.log(area)
                  console.log(imageUrl)
                  index++;
                  if (titleMatch && dateMatch) {
                    events.push({
                      title: titleMatch[1],
                      date: dateMatch[1],
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error parsing event data:", error);
          }
        }
      });

      return NextResponse.json({ events } as ApiResponse);
    }

    //send evetns
    const events: Event[] = [];
    for (const query of eventData) {
      if (query?.state?.data?.eventsList) {
        const eventsListData = query.state.data.eventsList;
        for (const event of eventsListData) {
          if (event.title && event.date) {
            events.push({
              title: event.title,
              date: event.date,
            } as Event);
          }
        }
      }
    }

    console.log(`Found ${events.length} events for ${artistName}`);
    return NextResponse.json({ events } as ApiResponse);

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to process request" } as ApiResponse, { status: 500 });
  }
}