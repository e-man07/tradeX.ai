import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const nativeFormData = new FormData();

    // Process each field in the form data
    for (const [key, value] of formData.entries()) {
      console.log(`Processing form field: ${key}, type: ${typeof value}`);
      
      if (value instanceof File) {
        console.log(`File details for ${key}:`, {
          name: value.name,
          type: value.type,
          size: value.size
        });
        
        nativeFormData.append(key, value, value.name);
      } else {
        nativeFormData.append(key, value);
      }
    }

    console.log("Sending request to pump.fun...");

    const response = await fetch("https://pump.fun/api/ipfs", {
      method: "POST",
      body: nativeFormData,
      headers: {
        'Accept': 'application/json',
      }
    });

    console.log("Received response from pump.fun:", {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      let errorMessage = `IPFS Upload Failed: ${response.status} ${response.statusText}`;
      let errorDetails = '';
      
      try {
        const errorText = await response.text();
        if (errorText) {
          errorDetails = errorText;
        }
      } catch (e) {
        console.error("Failed to read error response:", e);
      }

      console.error("IPFS upload failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorDetails
      });
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails || 'No additional error details available'
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully received data from pump.fun:", data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Top-level error in IPFS upload:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: "Internal Server Error",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}