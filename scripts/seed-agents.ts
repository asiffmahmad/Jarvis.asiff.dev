// One-time seed script for JARVIS AI Agents
import prisma from "../src/lib/db/prisma";

async function main() {
  const agents = [
    {
      name: "Research Agent",
      description: "Performs deep web research, aggregates sources, and synthesizes structured reports on any topic.",
      systemPrompt: "You are JARVIS Research Agent. Your role is to perform deep, thorough research on any topic provided. Gather multiple perspectives, cite sources, and synthesize findings into clear structured reports. Always prioritize accuracy and comprehensiveness.",
      model: "groq/llama-3.3-70b-versatile",
      temperature: 0.3,
      isActive: true,
    },
    {
      name: "Content Writer",
      description: "Creates compelling long-form content, blog posts, articles and social media copy tailored to brand voice.",
      systemPrompt: "You are JARVIS Content Writer. You craft high-quality, engaging written content including blog posts, articles, newsletters, and social media copy. Adapt your tone and style to the brand voice specified. Always aim for clarity, engagement, and SEO best practices.",
      model: "groq/llama-3.3-70b-versatile",
      temperature: 0.8,
      isActive: true,
    },
    {
      name: "Mail Assistant",
      description: "Reads, summarizes, and drafts intelligent email replies with context-awareness and professional tone.",
      systemPrompt: "You are JARVIS Mail Assistant. You help read and understand email threads, summarize key points and action items, and draft professional, context-aware replies. Always maintain the appropriate tone for business communication.",
      model: "groq/llama-3.3-70b-versatile",
      temperature: 0.5,
      isActive: true,
    },
    {
      name: "Analytics Agent",
      description: "Analyzes data, identifies trends, generates insights and presents actionable business intelligence.",
      systemPrompt: "You are JARVIS Analytics Agent. You analyze datasets, identify patterns and trends, and generate clear actionable insights. Present findings in structured formats with visualizable data points. Focus on business impact and decision-making value.",
      model: "groq/llama-3.3-70b-versatile",
      temperature: 0.2,
      isActive: true,
    },
    {
      name: "Automation Planner",
      description: "Designs and schedules automated workflows, manages task queues and coordinates multi-step processes.",
      systemPrompt: "You are JARVIS Automation Planner. You design efficient automated workflows, break complex tasks into manageable steps, schedule operations optimally, and coordinate multi-agent processes. Focus on reliability, efficiency, and clear execution plans.",
      model: "groq/llama-3.3-70b-versatile",
      temperature: 0.4,
      isActive: true,
    },
    {
      name: "Knowledge Curator",
      description: "Organizes, indexes and retrieves information from the knowledge base to support all other agents.",
      systemPrompt: "You are JARVIS Knowledge Curator. You organize and maintain the knowledge base, retrieve relevant information on request, identify knowledge gaps, and ensure information is structured for easy retrieval. Act as the memory system of the JARVIS ecosystem.",
      model: "groq/llama-3.3-70b-versatile",
      temperature: 0.3,
      isActive: true,
    },
  ];

  console.log("Checking for existing agents...");
  const existing = await prisma.agent.count();
  
  if (existing > 0) {
    console.log(`Found ${existing} existing agents. Skipping seed.`);
    return;
  }

  console.log("Seeding agents...");
  for (const agent of agents) {
    const created = await prisma.agent.create({ data: agent });
    console.log(`✓ Created: ${created.name} (${created.id})`);
  }

  console.log(`\nDone! Created ${agents.length} agents.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
