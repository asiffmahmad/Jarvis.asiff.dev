# API Documentation

JARVIS utilizes Next.js Route Handlers (`src/app/api/...`) to expose a RESTful/RPC hybrid API for frontend consumption and third-party webhooks.

## Architecture
- All routes are built using the Next.js `app` directory conventions (e.g., `route.ts`).
- Responses are unified JSON envelopes.
- Authentication is handled via middleware/session checking prior to route execution.

## Core Routes

### Authentication
`POST /api/auth/login`
- **Payload:** `{ username, password }`
- **Response:** Session Token Cookie

`POST /api/auth/logout`
- **Action:** Destroys active session.

### AI Capabilities (Future Placeholders)
The following routes are stubbed and act as placeholders for future LangChain/AI SDK routing:

`POST /api/chat`
- Stream generic LLM completions.

`POST /api/agents/execute`
- Triggers a background agent execution run.

`POST /api/research/ai`
- Triggers sentiment analysis on Research Hub RSS feeds.

### System Health
`GET /api/health`
- **Response:** `200 OK { status: 'healthy', database: 'connected' }`
- **Usage:** Uptime monitoring and deployment checks.

## Error Handling
The API returns standardized JSON error responses:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Valid session token required.",
  "status": 401
}
```
