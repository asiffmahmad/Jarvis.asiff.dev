import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Forward Range header from client if present
    const requestHeaders: Record<string, string> = {};
    const rangeHeader = req.headers.get("range");
    if (rangeHeader) {
      requestHeaders["Range"] = rangeHeader;
    }

    const res = await fetch(targetUrl, { headers: requestHeaders });
    if (!res.ok && res.status !== 206) {
      return NextResponse.json({ error: `Target server returned status ${res.status}` }, { status: res.status });
    }

    const isMediaFile = /\.(mp4|m4a|mp3|wav|jpg|jpeg|png|gif|webp)/i.test(targetUrl) || targetUrl.includes("cdn.pixabay.com");
    const contentType = res.headers.get("content-type") || "";
    
    // If it's a JSON response (like Pixabay API metadata), return it parsed
    if (!isMediaFile && (contentType.includes("application/json") || contentType === "")) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    
    // Build response headers, copying range-specific headers
    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    };

    const contentRange = res.headers.get("content-range");
    if (contentRange) {
      responseHeaders["Content-Range"] = contentRange;
    }
    const acceptRanges = res.headers.get("accept-ranges");
    if (acceptRanges) {
      responseHeaders["Accept-Ranges"] = acceptRanges;
    }
    const contentLength = res.headers.get("content-length");
    if (contentLength) {
      responseHeaders["Content-Length"] = contentLength;
    }

    // Pipe the response body stream directly
    return new NextResponse(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to proxy request" }, { status: 500 });
  }
}
