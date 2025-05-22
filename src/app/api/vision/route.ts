import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;


export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return new NextResponse(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const visionPayload = {
      requests: [
        {
          image: { content: image },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    };

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visionPayload),
      }
    );

    const visionData = await visionRes.json();

    console.log("Google Vision API response:", visionData);

    return new NextResponse(JSON.stringify({
      message: "Processed",
      data: visionData,
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Error processing image:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
