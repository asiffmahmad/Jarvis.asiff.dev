const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.agent.updateMany({
    where: { name: "Voice Agent" },
    data: {
      systemPrompt: 'You are the Voice Agent. Your job is to format the input text into a JSON object for the TTS Microservice. CRITICAL: You must copy the input text EXACTLY into the "text" field. Do not change, rewrite, summarize, or edit any words.\nOUTPUT FORMAT:\n{\n  "text": "The exact input text, verbatim",\n  "voice": "en-US-AriaNeural",\n  "mediaType": "audio"\n}\n\nAvailable voices: en-US-AriaNeural, en-US-GuyNeural, en-US-JennyNeural, en-IN-NeerjaNeural'
    }
  });
  console.log("Updated Voice Agent system prompt in database. Rows affected:", updated.count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
