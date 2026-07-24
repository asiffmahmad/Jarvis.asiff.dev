import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, style } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const seed = Math.floor(Math.random() * 1000000);
    const stylePrompt = style === "Minimal" 
      ? "clean simple flat illustration style vector graphics on a solid matching background" 
      : style === "Neon Sci-fi" 
      ? "glowing neon sci-fi theme cyberpunk elements, dark dramatic lighting, ultra-detailed 8k" 
      : style === "Cyberpunk" 
      ? "gritty cyberpunk city style, holographic accents, neon lights, retrofuturism" 
      : "sleek professional corporate clean business tech design aesthetic";
      
    const fullPrompt = `${prompt}, ${stylePrompt}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=450&nologo=true&seed=${seed}`;

    // Fetch the image from the API
    const imageRes = await fetch(url);
    if (!imageRes.ok) {
      throw new Error(`Failed to fetch image from source: ${imageRes.statusText}`);
    }

    const buffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error("[CAROUSEL IMAGE GENERATION API] Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to generate image blob" },
      { status: 500 }
    );
  }
}
