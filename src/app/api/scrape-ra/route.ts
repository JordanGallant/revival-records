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
    // Parse the request body to get the artist name
    const body = await request.json();
    const { artistName } = body;
    
    if (!artistName) {
      return NextResponse.json({ error: "Artist name is required" } as ApiResponse, { status: 400 });
    }
    
    // Fetch the artist's page from Resident Advisor
    const res = await fetch(`https://ra.co/dj/${artistName}/tour-dates`, {
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
    
    // Find the script with the event data
    // Resident Advisor typically loads data into window.__NEXT_DATA__
    let eventData: any = null;
    $("script").each((_, el) => {
      const scriptContent = $(el).html();
      if (scriptContent && scriptContent.includes('window.__NEXT_DATA__')) {
        try {
          // Extract the JSON data from the script tag
          const jsonStr = scriptContent.trim().replace('window.__NEXT_DATA__ = ', '');
          const data = JSON.parse(jsonStr);
          // Look for events in the data structure
          eventData = data?.props?.pageProps?.dehydratedState?.queries || [];
        } catch (err) {
          console.error("Error parsing script JSON:", err);
        }
      }
    });
    if (!eventData) {
      const events: Event[] = [];
      $("script").each((_, el) => {
        const scriptContent = $(el).html();
        if (scriptContent && scriptContent.includes('"__typename":"Event"')) {
          try {
            const eventMatches = scriptContent.match(/"__typename":"Event".*?"title":"(.*?)".*?"date":"(.*?)"/g);
            if (eventMatches) {
              for (const match of eventMatches) {
                const titleMatch = match.match(/"title":"(.*?)"/);
                const dateMatch = match.match(/"date":"(.*?)"/);
                if (titleMatch && dateMatch) {
                  events.push({
                    title: titleMatch[1],
                    date: dateMatch[1],
                  });
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

    const events: Event[] = [];
        for (const query of eventData) {
      if (query?.state?.data?.eventsList) {
        const eventsListData = query.state.data.eventsList;
        for (const event of eventsListData) {
          if (event.title && event.date) {
            events.push({
              title: event.title,
              date: event.date,
              // Add more fields as needed
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