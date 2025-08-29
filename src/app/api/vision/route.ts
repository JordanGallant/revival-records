import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY!;
const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT!; 
// Example: "https://<your-resource-name>.cognitiveservices.azure.com"

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

    // Convert Base64 → Buffer
    const buffer = Buffer.from(image, "base64");

    // Step 1: Submit to Azure OCR
    const submitRes = await fetch(`${AZURE_VISION_ENDPOINT}/vision/v3.2/read/analyze`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!submitRes.ok) {
      const text = await submitRes.text();
      console.error("Azure Vision submit error:", text);
      return new NextResponse(JSON.stringify({ error: text }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const operationLocation = submitRes.headers.get("operation-location");
    if (!operationLocation) {
      throw new Error("No operation-location header from Azure Vision API");
    }

    // Step 2: Poll results
    let result;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000)); // wait 1s
      const pollRes = await fetch(operationLocation, {
        headers: { "Ocp-Apim-Subscription-Key": AZURE_VISION_KEY },
      });
      result = await pollRes.json();
      if (result.status === "succeeded" || result.status === "failed") break;
    }

    return new NextResponse(JSON.stringify({
      message: "Processed",
      data: result,
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error: any) {
    console.error("Error processing image:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
