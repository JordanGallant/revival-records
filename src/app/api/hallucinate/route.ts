import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      image, 
      email, 
      layer_index = 35, 
      steps = 500, 
      step_size = 0.03, 
      multiscale = false,
      guide_image 
    } = body;

    // Validate both image and email are provided
    if (!image) {
      return new NextResponse(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!email) {
      return new NextResponse(JSON.stringify({ error: "No email provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new NextResponse(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Validate parameters
    if (layer_index < 0 || layer_index > 36) {
      return new NextResponse(JSON.stringify({ error: "Layer index must be between 0 and 36" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (steps < 10 || steps > 2000) {
      return new NextResponse(JSON.stringify({ error: "Steps must be between 10 and 2000" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (step_size < 0.001 || step_size > 0.1) {
      return new NextResponse(JSON.stringify({ error: "Step size must be between 0.001 and 0.1" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("Processing request for email:", email);

    // Convert base64 image to blob/file for multipart upload
    let imageBlob;
    if (image.startsWith('data:')) {
      // Handle data URL format (data:image/jpeg;base64,...)
      const response = await fetch(image);
      imageBlob = await response.blob();
    } else {
      // Handle base64 string
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageBlob = new Blob([bytes], { type: 'image/jpeg' });
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.jpg');
    formData.append('email', email);
    formData.append('layer_index', layer_index.toString());
    formData.append('steps', steps.toString());
    formData.append('step_size', step_size.toString());
    formData.append('multiscale', multiscale.toString());

    // Handle guide image if provided
    if (guide_image) {
      let guideBlob;
      if (guide_image.startsWith('data:')) {
        const response = await fetch(guide_image);
        guideBlob = await response.blob();
      } else {
        const base64Data = guide_image.replace(/^data:image\/[a-z]+;base64,/, '');
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        guideBlob = new Blob([bytes], { type: 'image/jpeg' });
      }
      formData.append('guide_image', guideBlob, 'guide.jpg');
    }

    console.log("Sending request to deep-dream API...");

    const dream = await fetch(
      `https://deep-dream-qgd8.onrender.com/deepdream`,
      {
        method: "POST",
        body: formData, // Send as FormData instead of JSON
      }
    );

    if (!dream.ok) {
      const errorText = await dream.text();
      console.error("Dream API error response:", errorText);
      throw new Error(`Dream API request failed: ${dream.status} ${dream.statusText}`);
    }

    const visionData = await dream.json();

    console.log("Deep Dream API response:", visionData);

    return new NextResponse(JSON.stringify({
      message: "Processed successfully",
      email: email,
      data: visionData,
    }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new NextResponse(JSON.stringify({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}