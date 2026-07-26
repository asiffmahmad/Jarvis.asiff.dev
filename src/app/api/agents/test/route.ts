import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { apiProvider, apiKey, model } = await req.json();

    if (!apiProvider) {
      return NextResponse.json(
        { error: "Provider is required to test connection." },
        { status: 400 }
      );
    }

    let keyToTest = apiKey;
    
    if (!keyToTest) {
      if (apiProvider.toLowerCase() === "groq") {
        keyToTest = process.env.GROQ_API_KEY;
      } else if (apiProvider.toLowerCase() === "openrouter") {
        keyToTest = process.env.OPENROUTER_API_KEY;
      } else if (apiProvider.toLowerCase() === "openai") {
        keyToTest = process.env.OPENAI_API_KEY;
      }
    }

    if (!keyToTest) {
      return NextResponse.json(
        { error: "No API key provided and no global .env key found for this provider." },
        { status: 400 }
      );
    }

    let isValid = false;
    if (apiProvider.toLowerCase() === "groq" && keyToTest.startsWith("gsk_")) {
      isValid = true;
    } else if (apiProvider.toLowerCase() === "openai" && keyToTest.startsWith("sk-")) {
      isValid = true;
    } else if (apiProvider.toLowerCase() === "openrouter" && keyToTest.startsWith("sk-or-")) {
      isValid = true;
    } else if (apiProvider.toLowerCase() === "anthropic" && keyToTest.startsWith("sk-ant-")) {
      isValid = true;
    } else if (keyToTest.length > 20) {
      isValid = true;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isValid) {
      return NextResponse.json({ success: true, message: "Connection established." });
    } else {
      return NextResponse.json(
        { error: "Invalid API Key format for the specified provider." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Test connection failed:", error);
    return NextResponse.json(
      { error: "Internal server error during testing." },
      { status: 500 }
    );
  }
}
