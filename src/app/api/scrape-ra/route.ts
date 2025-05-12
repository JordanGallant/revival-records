import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  const res = await fetch("https://ra.co/dj/interplanetarycriminal/tour-dates", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  //load page content
  const html = await res.text();
  const $ = cheerio.load(html);
  const scripts: string[] = [];
  $("script").each((_, el) => {
    const scriptContent = $(el).html();
    if (scriptContent) {
      scripts.push(scriptContent.trim());
    }
  });

  let eventTitles: string[] = [];
  for (const script of scripts) {
        //specific event
    if (script.includes('"__typename":"Event"') && script.includes('"title":')) {
      try {
        const eventMatches = script.match(/"__typename":"Event","title":"([^"]+)"/g);
        
        if (eventMatches) {
          for (const match of eventMatches) {
            const titleMatch = match.match(/"title":"([^"]+)"/);
            if (titleMatch && titleMatch[1]) {
              eventTitles.push(titleMatch[1]);
            }
          }
        }
      } catch (error) {
        console.error("Error parsing script content:", error);
      }
    }
  }

  return NextResponse.json({ eventTitles });
}