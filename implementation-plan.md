# Implementation Plan

## Goal
Create two new AI agents — Media Coordinator and Merge Agent — and integrate them into the Audio & Video Pipeline so that:
- The post content is analyzed to produce a synchronized audio script + video search query
- The Voice Agent reads the coordinated script (not the raw topic)
- The Media Developer uses the coordinated search query
- The Merge Agent confirms readiness and triggers the merge API
- JARVIS validates the final result

---

## File 1: `src/app/api/agents/registry/route.ts`
**Change:** Add auto-seed for Media Coordinator and Merge Agent
**Location:** After the Voice Agent auto-seed block (around line 118) and before the return on line 122.

### Add this block for Media Coordinator:
```typescript
// Auto-seed Media Coordinator if it doesn't exist
if (!agents.find((a: any) => a.name === "Media Coordinator")) {
  await prisma.$executeRaw`
    INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
    VALUES (
      ${Math.random().toString(36).substring(7)},
      'Media Coordinator',
      'Creates a synchronized audio-video production brief from the post content.',
      'You are the Media Coordinator. Your job is to take a generated post and create a synchronized audio-video production brief.\n\nAnalyze the post title, caption, hashtags, and platform. Then:\n\n1. Write a VOICE SCRIPT: Convert the caption into natural, conversational spoken-word narration optimized for speech delivery. Keep it between 60-90 words (fits in 15-25 seconds).\n\n2. Create a VIDEO SEARCH QUERY: Extract 2-5 essential keywords that best represent the visual concept. Max 100 characters.\n\n3. Choose a VOICE appropriate for the content tone.\n\nOutput ONLY valid JSON with this exact structure:\n{\n  "voiceScript": "The spoken narration, 60-90 words...",\n  "videoQuery": "keyword1 keyword2 keyword3",\n  "voice": "en-US-AriaNeural",\n  "expectedDuration": 20\n}\n\nRules:\n- voiceScript must be 60-90 words (15-25 seconds spoken)\n- videoQuery must not exceed 100 characters\n- expectedDuration must match the estimated duration of voiceScript in seconds\n- Return raw JSON only, no markdown, no code fences',
      'gpt-4',
      'groq',
      1000,
      1,
      NOW()
    )
  `;
  agents = await prisma.$queryRaw`SELECT * FROM Agent`;
}
```

### Add this block for Merge Agent (after the Media Coordinator block):
```typescript
// Auto-seed Merge Agent if it doesn't exist
if (!agents.find((a: any) => a.name === "Merge Agent")) {
  await prisma.$executeRaw`
    INSERT INTO Agent (id, name, description, systemPrompt, model, apiProvider, usageLeft, isActive, updatedAt)
    VALUES (
      ${Math.random().toString(36).substring(7)},
      'Merge Agent',
      'Verifies audio and video assets are ready and triggers the merge process.',
      'You are the Merge Agent. Your job is to verify that both audio and video assets are ready for merging.\n\nYour input contains the outputs of the Voice Agent and Media Developer. Verify that an audio script was generated and a video was found.\n\nIf both are ready, output ONLY this JSON:\n{\n  "instruction": "merge",\n  "status": "ready",\n  "message": "Both audio and video assets are ready for merging"\n}\n\nIf something is missing, output:\n{\n  "instruction": "merge",\n  "status": "failed",\n  "message": "Description of what is missing"\n}\n\nReturn raw JSON only, no markdown, no code fences.',
      'gpt-4',
      'groq',
      1000,
      1,
      NOW()
    )
  `;
  agents = await prisma.$queryRaw`SELECT * FROM Agent`;
}
```

---

## File 2: `src/app/api/pipeline/config/route.ts`

### Change A: Add agent lookups
**Location:** After line 49 (`const voiceAgent = agents.find(a => a.name === "Voice Agent");`)
```typescript
const coordinatorAgent = agents.find((a: any) => a.name === "Media Coordinator");
const mergeAgent = agents.find((a: any) => a.name === "Merge Agent");
```

### Change B: Update Audio & Video Pipeline flow
**Location:** Lines 65-78, the block that creates `audioVideoPipeline`

**Replace:**
```typescript
if (!audioVideoPipeline) {
  const flowIds = [];
  if (plannerAgent) flowIds.push(plannerAgent.id);
  if (mediaAgent) flowIds.push(mediaAgent.id);
  if (voiceAgent) flowIds.push(voiceAgent.id);
```

**With:**
```typescript
if (!audioVideoPipeline) {
  const flowIds = [];
  if (plannerAgent) flowIds.push(plannerAgent.id);
  if (coordinatorAgent) flowIds.push(coordinatorAgent.id);
  if (mediaAgent) flowIds.push(mediaAgent.id);
  if (voiceAgent) flowIds.push(voiceAgent.id);
  if (mergeAgent) flowIds.push(mergeAgent.id);
```

---

## File 3: `src/components/agents/agent-pipeline.tsx`

### Change 1: Update isSpecializedAgent list (Line 301)
**Replace:**
```typescript
const isSpecializedAgent = ["Voice Agent", "Media Developer"].includes(stepNames[i]);
```
**With:**
```typescript
const isSpecializedAgent = ["Media Coordinator", "Media Developer", "Voice Agent", "Merge Agent"].includes(stepNames[i]);
```

### Change 2: Fix Voice Agent input to use voiceScript (Lines 328-332)
**Replace:**
```typescript
        if (stepNames[i] === "Voice Agent") {
          inputContext = `User Theme: ${topic.trim()}\n\nText to convert to speech (copy this EXACTLY into the "text" field):\n${promptInput}`;
        } else if (i > startIndex) {
          inputContext = `User Theme: ${topic.trim()}\n\n[Previous Step — ${stepNames[i - 1]}]:\n${stepResults[stepNames[i - 1]] || ""}\n\nOriginal Input:\n${promptInput}`;
        }
```
**With:**
```typescript
        if (stepNames[i] === "Voice Agent") {
          let voiceText = promptInput;
          const coordResult = stepResults["Media Coordinator"];
          if (coordResult) {
            try {
              const cleaned = coordResult.trim();
              const start = cleaned.indexOf("{");
              const end = cleaned.lastIndexOf("}");
              if (start !== -1 && end !== -1) {
                const coord = JSON.parse(cleaned.substring(start, end + 1));
                if (coord.voiceScript) voiceText = coord.voiceScript;
              }
            } catch {}
          }
          inputContext = `User Theme: ${topic.trim()}\n\nText to convert to speech (copy this EXACTLY into the "text" field):\n${voiceText}`;
        } else if (i > startIndex) {
          inputContext = `User Theme: ${topic.trim()}\n\n[Previous Step — ${stepNames[i - 1]}]:\n${stepResults[stepNames[i - 1]] || ""}\n\nOriginal Input:\n${promptInput}`;
        }
```

### Change 3: Remove old ad-hoc merge block (Lines 451-471)
**Replace:**
```typescript
        if (hasAudio && hasVideo && collectedAudioUrl && collectedVideoUrl) {
          ...
        }
```
**With:**
```typescript
        // Merge is now handled by the Merge Agent in the post-processing loop above
```

### Change 4: Add Merge Agent post-processing handler
**Location:** After line 448 (after the Media Developer handler's closing `}`), inside the `for (const name of stepNames)` loop body.

```typescript
          // 3. Check for Merge Agent — call the merge API
          if (name === "Merge Agent") {
            if (collectedAudioUrl && collectedVideoUrl) {
              setSteps(s => {
                const c = [...s];
                const mergeStep = c.find(x => x.name === "Merge Agent");
                if (mergeStep) mergeStep.operation = "Merging Audio & Video...";
                return c;
              });
              try {
                const mergeRes = await fetch("/api/media/merge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    pixabayApiUrl: collectedVideoUrl,
                    audioUrl: collectedAudioUrl,
                  }),
                });
                const mergeData = await mergeRes.json();
                if (mergeData.success && mergeData.videoUrl) {
                  mediaUrls.push(mergeData.videoUrl);
                  hasAudio = false;
                }
              } catch (err) {
                console.error("Media merge failed:", err);
              }
            }
          }
```

---

## Pipeline Flow After Changes
1. **Automation Planner** → Full post JSON (title, caption, hashtags...)
2. **Media Coordinator** → { voiceScript, videoQuery, voice, expectedDuration }
3. **Media Developer** → { query, mediaType, apiUrl } → resolves to videoUrl
4. **Voice Agent** → { text: voiceScript, voice, mediaType } → TTS generates audioUrl
5. **Merge Agent** → { instruction: "merge", status: "ready" } → post-processing calls merge API
6. **JARVIS** → APPROVED/REJECTED with final post JSON

### How post-processing works (within the `for (const name of stepNames)` loop):
| Iteration | Agent | Post-processing action |
|-----------|-------|----------------------|
| 1 | Automation Planner | (none — content agent) |
| 2 | Media Coordinator | (none — just passes voiceScript and videoQuery to subsequent steps) |
| 3 | Media Developer | Resolves Pixabay API URL → downloads video → stores as blob → sets collectedVideoUrl |
| 4 | Voice Agent | Calls /api/tts/generate → gets audioUrl → sets collectedAudioUrl |
| 5 | Merge Agent | Calls /api/media/merge with collectedVideoUrl + collectedAudioUrl → pushes mergedVideoUrl to mediaUrls |
| 6 | JARVIS | (handled separately in JARVIS validation logic) |

---

## Testing
After implementing, test with:
1. Restart the Next.js dev server and the TTS agent (`tts-agent`)
2. Navigate to the Agent Pipeline page
3. Enter "Introducing the Latest Mobile Phone" as the topic
4. Select "Audio & Video Pipeline" from the dropdown
5. Click "Deploy Swarm"

### Verify:
- Media Coordinator step runs and produces { voiceScript, videoQuery, voice }
- Media Developer resolves a Pixabay video URL
- Voice Agent generates TTS audio
- Merge Agent runs and shows "Merging Audio & Video..."
- JARVIS approves
- The final post redirects to /create with the merged MP4 video playing properly (with audio)

---

## Summary of all changes
| File | Changes |
|------|---------|
| `src/app/api/agents/registry/route.ts` | +2 auto-seed blocks (Media Coordinator + Merge Agent) |
| `src/app/api/pipeline/config/route.ts` | +2 agent lookups; Audio & Video Pipeline flow: [Planner → Coordinator → Media → Voice → Merge] |
| `src/components/agents/agent-pipeline.tsx` | 4 changes: isSpecializedAgent list, Voice Agent input, remove old merge block, add Merge Agent post-processing |
