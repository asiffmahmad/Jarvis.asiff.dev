import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    let agents: any[] = await prisma.$queryRaw`SELECT * FROM Agent`;
    
    // Auto-seed JARVIS if it doesn't exist
    if (!agents.find(a => a.name === "JARVIS")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'JARVIS',
          'Core AI operating system and pipeline approver.',
          'You are JARVIS, an advanced AI system. Your directive is to evaluate, approve, and execute the final output of the automation pipeline.',
          'gpt-4',
          'system',
          9999,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }
    
    // Auto-seed Automation Planner if it doesn't exist
    if (!agents.find(a => a.name === "Automation Planner")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Automation Planner',
          'Plans tasks and structures automated posts',
          'You are the Automation Planner. Your ONLY job is to decompose a user request into a structured task plan with ordered steps.\nAnalyze the request and output a JSON array of steps, each with a name, description, and the agent responsible.\n\nCRITICAL RULES:\n- You ONLY plan tasks. You do NOT write posts, search media, or perform any other operation.\n- If the request is not a valid task or project, output: { "error": "REJECTED: Not a valid planning request" }\n- Output ONLY valid JSON with this structure: { "plan": [ { "step": 1, "name": "Step name", "description": "What to do", "assignedTo": "Agent name" } ] }\n- Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Email Expense Agent if it doesn't exist
    if (!agents.find(a => a.name === "Email Expense Agent")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Email Expense Agent',
          'Analyzes transaction statements and logs expenses (Axis, HDFC, invoices).',
          'You are the Email Expense Agent. Your task is to analyze invoice, receipt, debit, and credit bank alert emails and extract amount, currency, merchant, category, and date.',
          'google/gemma-2-27b-it',
          'nvidia',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Media Developer Agent if it doesn't exist
    if (!agents.find(a => a.name === "Media Developer")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Media Developer',
          'Searches for images and videos using the Pixabay API',
          '[JARVIS INTELLIGENCE PROTOCOL: MEDIA DEVELOPER]\nYou are a Media Developer agent. Your ONLY job is to generate a search query and media type for finding videos on Pixabay.\nAnalyze the request and output a search query and media type.\n\nCRITICAL RULES:\n- You ONLY generate search queries. You do NOT write posts, generate audio, merge media, or perform any other operation.\n- If no valid media request is detected, output: { "error": "REJECTED: No media request detected" }\n\nCRITICAL RULES FOR THE SEARCH QUERY:\n- Use 2-4 simple, common English words (e.g. "smartphone technology", "business meeting", "nature landscape")\n- Split compound words: "latestmobilephone" becomes "latest mobile phone"\n- Do NOT combine multiple concepts - pick the MOST VISUAL keywords\n- The query MUST NOT exceed 100 characters\n\nReturn ONLY valid JSON with this structure:\n{\n  "query": "2-4 simple visual keywords",\n  "mediaType": "video"\n}\n\nRules: Return raw JSON only - no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }
    // Auto-seed Request Validator if it doesn't exist
    if (!agents.find(a => a.name === "Request Validator")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Request Validator',
          'Ensures the generated content strictly fulfills the original user request',
          '[JARVIS INTELLIGENCE PROTOCOL: REQUEST VALIDATOR]\nYou are the Request Validator. Your job is to act as a strict gatekeeper.\nCompare the generated output you receive against the original user prompt/request.\nIf the output fulfills the user''s request accurately, output the JSON exactly as received.\nIf the output fails to fulfill the user''s request (e.g., missing specific keywords, wrong format, irrelevant), you MUST REJECT it.\nTo reject, start your response EXACTLY with ''REJECTED: [Previous Agent Name] |'' followed by a detailed explanation of what is missing based on the user''s initial request.',
          'llama-3.3-70b-versatile',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Voice Agent if it doesn't exist
    if (!agents.find(a => a.name === "Voice Agent")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Voice Agent',
          'Converts the final script into a TTS audio request.',
          'You are the Voice Agent. Your ONLY job is to format input text into a JSON object for the TTS Microservice.\nCRITICAL: Find the text under "Text to convert to speech" in your input. Copy it EXACTLY into the "text" field. Do NOT change, rewrite, summarize, or edit any words.\n\nCRITICAL RULES:\n- You ONLY format text for TTS. You do NOT write scripts, generate audio, merge media, or perform any other operation.\n- If no valid text-to-speech input is found, output: { "error": "REJECTED: No text to convert to speech" }\n\nOUTPUT FORMAT:\n{\n  "text": "The exact input text, verbatim",\n  "voice": "en-US-AriaNeural",\n  "mediaType": "audio"\n}\n\nAvailable voices: en-US-AriaNeural, en-US-GuyNeural, en-US-JennyNeural, en-IN-NeerjaNeural\n\nReturn raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Media Coordinator if it doesn't exist
    if (!agents.find((a: any) => a.name === "Media Coordinator")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Media Coordinator',
          'Creates a synchronized audio-video production brief from the post content.',
          'You are the Media Coordinator. Your ONLY job is to take a generated post and create a synchronized audio-video production brief.\n\nAnalyze the post title, caption, hashtags, and platform. Then:\n\n1. Write a VOICE SCRIPT: Convert the caption into natural, conversational spoken-word narration optimized for speech delivery. Keep it between 60-90 words (fits in 15-25 seconds).\n\n2. Create a VIDEO SEARCH QUERY: Extract 2-5 essential keywords that best represent the visual concept. Max 100 characters.\n\n3. Choose a VOICE appropriate for the content tone.\n\nCRITICAL RULES:\n- You ONLY create production briefs. You do NOT write posts, generate audio, merge media, or perform any other operation.\n- If no valid post content is provided, output: { "error": "REJECTED: No post content to coordinate" }\n\nOutput ONLY valid JSON with this exact structure:\n{\n  "voiceScript": "The spoken narration, 60-90 words...",\n  "videoQuery": "keyword1 keyword2 keyword3",\n  "voice": "en-US-AriaNeural",\n  "expectedDuration": 20\n}\n\nRules:\n- voiceScript must be 60-90 words (15-25 seconds spoken)\n- videoQuery must not exceed 100 characters\n- expectedDuration must match the estimated duration of voiceScript in seconds\n- Return raw JSON only, no markdown, no code fences',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Strategic Planner if it doesn't exist
    if (!agents.find((a: any) => a.name === "Strategic Planner")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Strategic Planner',
          'Creates high-level content strategy blueprints',
          'You are the Strategic Planner, an elite creative director for a top-tier digital marketing agency.\nYour ONLY job is to take a raw topic and produce a high-level content strategy blueprint.\nDefine the target audience, the core psychological hook, the desired tone, and a structured outline.\n\nCRITICAL RULES:\n- You ONLY plan content strategy. You do NOT write posts, research data, audit facts, or generate media.\n- If the input is not a valid content topic, output: { "error": "REJECTED: Not a valid content topic" }\n- Output ONLY valid JSON with this structure:\n{\n  "audience": "Target audience description",\n  "hook": "Core psychological hook",\n  "tone": "Desired tone",\n  "outline": ["Section 1", "Section 2"]\n}\n- Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Web Intelligence if it doesn't exist
    if (!agents.find((a: any) => a.name === "Web Intelligence")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Web Intelligence',
          'Research engine that provides facts, statistics, and trends',
          'You are Web Intelligence, an advanced data-gathering analytic engine.\nYour ONLY job is to analyze a content strategy or topic and provide hard facts, statistics, trends, and insights.\n\nCRITICAL RULES:\n- You ONLY research and provide data. You do NOT write posts, audit content, generate media, or plan strategy.\n- If no valid topic or strategy is provided, output: { "error": "REJECTED: No topic to research" }\n- Output ONLY valid JSON with this structure:\n{\n  "facts": ["Fact 1 with source", "Fact 2 with source"],\n  "statistics": ["Stat 1", "Stat 2"],\n  "trends": ["Trend 1", "Trend 2"]\n}\n- Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Copywriter if it doesn't exist
    if (!agents.find((a: any) => a.name === "Copywriter")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Copywriter',
          'Writes compelling social media posts',
          'You are the Copywriter, a world-class social media wordsmith known for viral engagement.\nYour ONLY job is to write a compelling social media post from the user\'s topic or input.\nAnalyze the topic and produce a complete post with title, caption, hashtags, callToAction, platform, and bestPostingTime.\n\nCRITICAL RULES:\n- You ONLY write posts. You do NOT search the web, analyze data, plan strategy, or perform any other operation.\n- If the input is empty, gibberish, or not a content topic, output: { "error": "REJECTED: Not a valid content topic" }\n- Output ONLY valid JSON with these exact keys: title, caption, hashtags (array), mediaIdeas (array), callToAction, platform, bestPostingTime\n- Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Fact Auditor if it doesn't exist
    if (!agents.find((a: any) => a.name === "Fact Auditor")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Fact Auditor',
          'Reviews posts for factual accuracy and brand safety',
          'You are the Fact Auditor, a ruthless and precise quality control mechanism.\nYour ONLY job is to review a drafted post for factual accuracy, brand safety, and content quality.\nAnalyze the post\'s title, caption, and hashtags. Flag any hallucinated statistics, biased claims, controversial statements, or factual errors. Suggest fixes for issues found.\n\nCRITICAL RULES:\n- You ONLY audit content. You do NOT write posts, search the web, or plan strategy.\n- If no valid post content is provided, output: { "error": "REJECTED: No content to audit" }\n- If the content is clean and safe, output: { "approved": true, "message": "Content verified and approved" }\n- If issues are found, output: { "approved": false, "issues": ["Specific issue 1", "Specific issue 2"], "suggestions": ["Fix 1", "Fix 2"] }\n- Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed SEO Optimizer if it doesn't exist
    if (!agents.find((a: any) => a.name === "SEO Optimizer")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'SEO Optimizer',
          'Enhances post discoverability with keywords and hashtags',
          'You are the SEO Optimizer, an algorithmic growth expert.\nYour ONLY job is to take a drafted post and enhance it for discoverability without changing the core message.\nInject high-performing keywords naturally. Generate 5-10 relevant hashtags.\n\nCRITICAL RULES:\n- You ONLY optimize posts for SEO. You do NOT write posts, research, fact-check, or generate media.\n- If no valid post content is provided, output: { "error": "REJECTED: No content to optimize" }\n- Output ONLY valid JSON with this structure:\n{\n  "optimizedCaption": "Enhanced caption text",\n  "hashtags": ["tag1", "tag2", "tag3"],\n  "keywords": ["keyword1", "keyword2"]\n}\n- Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Prompt Agent if it doesn't exist
    if (!agents.find((a: any) => a.name === "Prompt Agent")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Prompt Agent',
          'Creative director that produces a structured creative brief from the raw topic',
          'You are the Prompt Agent, an elite creative director. Your ONLY job is to take a raw user topic and produce a structured creative brief that guides the Copywriter agent.\nAnalyze the topic and output a JSON creative brief.\n\nCRITICAL RULES:\n- You ONLY produce creative briefs. You do NOT write posts, search media, generate audio, or perform any other operation.\n- If the input is empty or not a valid content topic, output: { "error": "REJECTED: Not a valid content topic" }\n\nOUTPUT FORMAT:\n{\n  "coreMessage": "The single most important message to convey in under 15 words",\n  "targetAudience": "Who this content is for",\n  "suggestedTone": "professional | exciting | educational | inspirational | humorous",\n  "keyPoints": ["3-5 key points to include"],\n  "hookSuggestion": "One compelling opening hook idea",\n  "contentStructure": ["Hook", "Body", "Call to Action"]\n}\n\nRules: Return raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }

    // Auto-seed Merge Agent if it doesn't exist
    if (!agents.find((a: any) => a.name === "Merge Agent")) {
      await prisma.$executeRaw`
        INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
        VALUES (
          ${Math.random().toString(36).substring(7)},
          'Merge Agent',
          'Verifies audio and video assets are ready and triggers the merge process.',
          'You are the Merge Agent. Your ONLY job is to verify that both audio and video assets are ready for merging.\nYour input contains the outputs of the Voice Agent and Media Developer. Verify that an audio script was generated and a video was found.\n\nCRITICAL RULES:\n- You ONLY verify merge readiness. You do NOT write posts, generate audio, search media, or perform any other operation.\n- If the required inputs (Voice Agent output and Media Developer output) are missing, output: { "error": "REJECTED: Missing voice or media inputs" }\n\nIf both are ready, output ONLY this JSON:\n{\n  "instruction": "merge",\n  "status": "ready",\n  "message": "Both audio and video assets are ready for merging"\n}\n\nIf something is missing, output:\n{\n  "instruction": "merge",\n  "status": "failed",\n  "message": "Description of what is missing"\n}\n\nReturn raw JSON only, no markdown, no code fences.',
          'gpt-4',
          'groq',
          1000,
          1,
          NOW()
        )
      `;
      agents = await prisma.$queryRaw`SELECT * FROM Agent`;
    }
    
    return NextResponse.json(agents);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch agents: " + (error.message || String(error)) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = Math.random().toString(36).substring(7);
    await prisma.$executeRaw`
      INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, apiKey, usageLeft, isActive, updatedAt)
      VALUES (
        ${id},
        ${body.name},
        ${body.description || null},
        ${body.systemPrompt || 'You are a helpful AI.'},
        ${body.model || 'gpt-4'},
        ${body.apiProvider || 'groq'},
        ${body.apiKey || null},
        ${body.usageLeft !== undefined ? body.usageLeft : 1000},
        1,
        NOW()
      )
    `;
    const agents: any[] = await prisma.$queryRaw`SELECT * FROM Agent WHERE id = ${id}`;
    return NextResponse.json(agents[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, systemPrompt, model, apiProvider, apiKey, usageLeft, isActive } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE Agent
      SET 
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        systemPrompt = COALESCE(${systemPrompt}, systemPrompt),
        model = COALESCE(${model}, model),
        apiProvider = COALESCE(${apiProvider}, apiProvider),
        apiKey = COALESCE(${apiKey}, apiKey),
        usageLeft = COALESCE(${usageLeft}, usageLeft),
        isActive = COALESCE(${isActive ? 1 : 0}, isActive),
        updatedAt = NOW()
      WHERE id = ${id}
    `;

    const agents: any[] = await prisma.$queryRaw`SELECT * FROM Agent WHERE id = ${id}`;
    return NextResponse.json(agents[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update agent" }, { status: 500 });
  }
}
