import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      // For JSON metadata, forward it directly to pump.fun
      const jsonData = await req.json();
      
      // Send the complete metadata object to pump.fun
      const response = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: JSON.stringify(jsonData),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });
      
      console.log("Received response from pump.fun:", {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        let errorMessage = `IPFS Upload Failed: ${response.status} ${response.statusText}`;
        let errorDetails = await response.text();
        
        return NextResponse.json(
          { error: errorMessage, details: errorDetails },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // For form data (file uploads), keep the existing logic
      console.log("Processing form data");
      const formData = await req.formData();
      let nativeFormData = new FormData();
      
      for (const [key, value] of formData.entries()) {
        if (value && typeof value === 'object' && 'size' in value && 'type' in value && 'name' in value) {
          nativeFormData.append(key, value, value.name);
        } else {
          nativeFormData.append(key, value);
        }
      }
      
      const response = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: nativeFormData,
        headers: {
          Accept: "application/json",
        }
      });
      
      if (!response.ok) {
        let errorMessage = `IPFS Upload Failed: ${response.status} ${response.statusText}`;
        let errorDetails = await response.text();
        
        return NextResponse.json(
          { error: errorMessage, details: errorDetails },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error in IPFS upload:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
