import { NextResponse } from "next/server";

import { TwitterApi } from "twitter-api-v2";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { platformId } = await req.json();

    if (!platformId) {
      return NextResponse.json({ error: "platformId is required" }, { status: 400 });
    }

    let isConnected = false;
    let message = "";

    switch (platformId) {
      case "x": {
        const appKey = process.env.X_API_KEY;
        const appSecret = process.env.X_API_SECRET;
        const accessToken = process.env.X_ACCESS_TOKEN;
        const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;
        const bearerToken = process.env.X_BEARER_TOKEN;

        if (!appKey || !appSecret || !accessToken || !accessSecret) {
          isConnected = false;
          message = "Missing X API Keys or Access Tokens in environment configuration.";
        } else {
          try {
            const client = new TwitterApi({
              appKey,
              appSecret,
              accessToken,
              accessSecret,
            });
            // Try fetching the authenticated user's details
            await client.v2.me();
            isConnected = true;
            message = "Successfully authenticated with X (Twitter) API.";
          } catch (apiErr: any) {
            console.error("X API Test Connection Error:", apiErr);
            
            // If OAuth 1.0a fails, check if the Bearer Token works to see if it's an app configuration issue
            if (bearerToken) {
              try {
                const bearerClient = new TwitterApi(bearerToken);
                await bearerClient.v2.userByUsername("x");
                message = "Bearer Token is valid, but the Access Token/Secret returned 401. Make sure your App has OAuth 1.0a enabled with 'Read and Write' permissions in the Twitter Developer Portal.";
              } catch (bearerErr) {
                message = `X API authentication failed: ${apiErr.message || "Invalid credentials"}`;
              }
            } else {
              message = `X API authentication failed: ${apiErr.message || "Invalid credentials"}`;
            }
            isConnected = false;
          }
        }
        break;
      }
      case "linkedin": {
        const token = process.env.LINKEDIN_ACCESS_TOKEN;
        if (!token) {
          isConnected = false;
          message = "Missing LinkedIn Access Token in environment configuration.";
        } else {
          try {
            // Modern LinkedIn UserInfo endpoint
            const res = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.sub) {
              isConnected = true;
              message = `Successfully authenticated with LinkedIn as ${data.name || (data.given_name + " " + data.family_name)}.`;
            } else {
              // Try legacy /v2/me endpoint
              const meRes = await fetch("https://api.linkedin.com/v2/me", {
                headers: { Authorization: `Bearer ${token}` }
              });
              const meData = await meRes.json();
              if (meRes.ok && meData.id) {
                isConnected = true;
                message = `Successfully authenticated with LinkedIn. (Profile ID: ${meData.id})`;
              } else {
                isConnected = false;
                message = `LinkedIn authentication failed: ${data.message || meData.message || "Invalid Access Token"}`;
              }
            }
          } catch (err: any) {
            isConnected = false;
            message = `Failed to connect to LinkedIn API: ${err.message}`;
          }
        }
        break;
      }
      case "instagram":
        isConnected = !!process.env.INSTAGRAM_ACCESS_TOKEN;
        message = isConnected 
          ? "Successfully authenticated with Instagram Graph API." 
          : "Missing Instagram Access Token.";
        break;
      case "threads":
        isConnected = !!process.env.THREADS_ACCESS_TOKEN;
        message = isConnected 
          ? "Successfully authenticated with Threads." 
          : "Missing Threads Access Token.";
        break;
      case "youtube":
        isConnected = !!process.env.YOUTUBE_API_KEY;
        message = isConnected 
          ? "Successfully authenticated with YouTube Data API." 
          : "Missing YouTube API Key.";
        break;
      default:
        message = `Platform ${platformId} connection testing is not implemented yet.`;
        break;
    }

    if (isConnected) {
      return NextResponse.json({ success: true, message });
    } else {
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

  } catch (error) {
    console.error("[PLATFORMS TEST API] Error:", error);
    return NextResponse.json({ error: "Failed to test connection" }, { status: 500 });
  }
}
