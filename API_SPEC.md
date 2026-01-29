# 📡 Agents Dashboard - API Specification v2.0

**Updated:** 29 ינואר 2026  
**Version:** 2.0 (with Clawdbot integration)

---

## 🌐 Base URL

**Development:**
- HTTP: `http://localhost:3001`
- WebSocket: `ws://localhost:3001`

**Production:**
- HTTP: `https://your-domain.com`
- WebSocket: `wss://your-domain.com`

---

## 🔐 Authentication

Currently no authentication. Future versions will support:
- API keys
- JWT tokens
- OAuth2

---

## 📚 API Endpoints

### 🔵 Clawdbot Integration (NEW)

#### GET /api/clawdbot/sessions

קבל רשימת כל ה-sessions הפעילים מClawdbot.

**Query Parameters:**
- `active` (optional) - רק sessions פעילים (boolean, default: false)
- `kind` (optional) - סנן לפי kind: `direct` | `group`
- `model` (optional) - סנן לפי model name
- `limit` (optional) - מספר תוצאות מקסימלי (default: 100)

**Response 200:**
```json
{
  "success": true,
  "count": 5,
  "sessions": [
    {
      "id": "agent:main:subagent:8f08238d-4eac-49d4-9548-06bc5c956a3d",
      "sessionKey": "agent:main:subagent:8f08238d-4eac-49d4-9548-06bc5c956a3d",
      "kind": "direct",
      "model": "claude-sonnet-4.5",
      "contextTokens": 128000,
      "inputTokens": 4586,
      "outputTokens": 1107,
      "totalTokens": 62938,
      "startTime": 1769643999488,
      "lastActivity": 1769644017740,
      "status": "running",
      "isActive": true,
      "ageMs": 23820,
      "aborted": false
    }
  ]
}
```

**Error Responses:**
- `500` - Failed to read Clawdbot sessions

---

#### GET /api/clawdbot/sessions/:sessionId

קבל פרטים מלאים על session ספציפי.

**Path Parameters:**
- `sessionId` (required) - Session ID

**Response 200:**
```json
{
  "success": true,
  "session": {
    "id": "agent:main:subagent:8f08...",
    "sessionKey": "agent:main:subagent:8f08...",
    "kind": "direct",
    "model": "claude-sonnet-4.5",
    "contextTokens": 128000,
    "inputTokens": 4586,
    "outputTokens": 1107,
    "totalTokens": 62938,
    "startTime": 1769643999488,
    "lastActivity": 1769644017740,
    "status": "running",
    "isActive": true,
    "messages": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": 1769644000000,
        "tokens": 5
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": 1769644001000,
        "tokens": 10
      }
    ]
  }
}
```

**Error Responses:**
- `404` - Session not found
- `500` - Failed to read session data

---

#### GET /api/clawdbot/sessions/:sessionId/logs

קבל logs של session ספציפי.

**Path Parameters:**
- `sessionId` (required) - Session ID

**Query Parameters:**
- `limit` (optional) - מספר logs מקסימלי (default: 100)
- `offset` (optional) - offset לpagination (default: 0)
- `level` (optional) - סנן לפי level: `info` | `warning` | `error` | `debug`

**Response 200:**
```json
{
  "success": true,
  "count": 45,
  "logs": [
    {
      "id": 123,
      "sessionId": "agent:main:subagent:8f08...",
      "message": "Session started",
      "level": "info",
      "timestamp": 1769644000000
    },
    {
      "id": 124,
      "sessionId": "agent:main:subagent:8f08...",
      "message": "Processing user request",
      "level": "debug",
      "timestamp": 1769644001000
    }
  ]
}
```

---

#### GET /api/clawdbot/stats

קבל סטטיסטיקות כלליות על כל ה-sessions.

**Response 200:**
```json
{
  "success": true,
  "stats": {
    "totalSessions": 16,
    "activeSessions": 5,
    "idleSessions": 8,
    "completedSessions": 3,
    "totalTokensToday": 125000,
    "totalTokensAllTime": 1500000,
    "avgSessionDuration": 180000,
    "activeModels": [
      {
        "model": "claude-sonnet-4.5",
        "count": 8,
        "totalTokens": 75000
      },
      {
        "model": "gpt-5",
        "count": 5,
        "totalTokens": 45000
      }
    ],
    "sessionsByKind": {
      "direct": 14,
      "group": 2
    },
    "peakHours": [
      { "hour": 14, "count": 5 },
      { "hour": 16, "count": 4 }
    ]
  }
}
```

---

#### GET /api/clawdbot/models

קבל רשימת models זמינים וה-usage שלהם.

**Response 200:**
```json
{
  "success": true,
  "models": [
    {
      "name": "claude-sonnet-4.5",
      "contextTokens": 128000,
      "activeSessions": 8,
      "totalTokens": 75000,
      "avgTokensPerSession": 9375
    },
    {
      "name": "gpt-5",
      "contextTokens": 400000,
      "activeSessions": 5,
      "totalTokens": 45000,
      "avgTokensPerSession": 9000
    }
  ]
}
```

---

### 🟢 Agents (Existing - Enhanced)

#### GET /api/agents

קבל רשימת כל ה-agents (backward compatibility).

**Note:** בגרסה חדשה, זה יכול למזג עם `/api/clawdbot/sessions` או לשמש legacy endpoint.

**Response 200:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "agent-123",
      "name": "Data Analyzer",
      "label": "analyzer",
      "model": "gpt-4",
      "task": "Analyze sales data",
      "status": "running",
      "progress": 65,
      "startTime": 1769640000000,
      "endTime": null,
      "tokensIn": 1500,
      "tokensOut": 800,
      "createdAt": 1769640000000,
      "updatedAt": 1769644000000
    }
  ]
}
```

---

#### POST /api/agents

צור agent חדש (manual creation - legacy).

**Request Body:**
```json
{
  "id": "agent-456",
  "name": "Content Writer",
  "model": "claude-3",
  "task": "Write blog post",
  "status": "pending"
}
```

**Response 201:**
```json
{
  "success": true,
  "agent": {
    "id": "agent-456",
    "name": "Content Writer",
    "model": "claude-3",
    "task": "Write blog post",
    "status": "pending",
    "progress": 0,
    "startTime": null,
    "createdAt": 1769644000000,
    "updatedAt": 1769644000000
  }
}
```

---

#### GET /api/agents/:id

קבל פרטי agent ספציפי.

**Response 200:**
```json
{
  "success": true,
  "agent": {
    "id": "agent-123",
    "name": "Data Analyzer",
    "model": "gpt-4",
    "status": "running",
    "progress": 65,
    "startTime": 1769640000000,
    "tokensIn": 1500,
    "tokensOut": 800
  }
}
```

---

#### POST /api/agents/:id/update-status

עדכן סטטוס של agent.

**Request Body:**
```json
{
  "status": "running",
  "progress": 75,
  "tokensIn": 2000,
  "tokensOut": 1000
}
```

**Response 200:**
```json
{
  "success": true,
  "agent": {
    "id": "agent-123",
    "status": "running",
    "progress": 75,
    "tokensIn": 2000,
    "tokensOut": 1000,
    "updatedAt": 1769644100000
  }
}
```

---

#### POST /api/agents/:id/control

שליטה ב-agent (start/stop/restart/kill).

**Request Body:**
```json
{
  "action": "stop"
}
```

**Valid Actions:**
- `start` - התחל agent
- `stop` - עצור agent בצורה graceful
- `restart` - הפעל מחדש
- `kill` - עצור בכוח

**Response 200:**
```json
{
  "success": true,
  "message": "Agent stopped successfully",
  "agent": {
    "id": "agent-123",
    "status": "completed",
    "endTime": 1769644200000
  }
}
```

---

#### DELETE /api/agents/:id

מחק agent.

**Response 200:**
```json
{
  "success": true,
  "message": "Agent deleted successfully"
}
```

---

### 📝 Logs (Existing)

#### GET /api/agents/:id/logs

קבל logs של agent.

**Query Parameters:**
- `limit` (optional) - default: 100
- `offset` (optional) - default: 0
- `level` (optional) - filter by level

**Response 200:**
```json
{
  "success": true,
  "count": 45,
  "logs": [
    {
      "id": 1,
      "agentId": "agent-123",
      "message": "Started processing",
      "level": "info",
      "timestamp": 1769640000000
    }
  ]
}
```

---

#### POST /api/agents/:id/logs

הוסף log entry.

**Request Body:**
```json
{
  "message": "Completed task successfully",
  "level": "info"
}
```

**Response 201:**
```json
{
  "success": true,
  "log": {
    "id": 46,
    "agentId": "agent-123",
    "message": "Completed task successfully",
    "level": "info",
    "timestamp": 1769644000000
  }
}
```

---

#### DELETE /api/agents/:id/logs

מחק את כל ה-logs של agent.

**Response 200:**
```json
{
  "success": true,
  "message": "Logs cleared successfully"
}
```

---

#### GET /api/agents/:id/logs/export

ייצוא logs לקובץ טקסט.

**Response 200:**
```
Content-Type: text/plain
Content-Disposition: attachment; filename="agent-123-logs.txt"

[2026-01-29 01:00:00] INFO: Started processing
[2026-01-29 01:00:05] DEBUG: Loading data
[2026-01-29 01:00:10] INFO: Processing 1000 records
...
```

---

### 📊 Statistics (Existing)

#### GET /api/stats

קבל סטטיסטיקות dashboard כלליות.

**Response 200:**
```json
{
  "success": true,
  "stats": {
    "totalAgents": 25,
    "runningAgents": 5,
    "completedAgents": 18,
    "errorAgents": 2,
    "totalTokensUsed": 150000,
    "avgTokensPerAgent": 6000,
    "avgCompletionTime": 180000
  }
}
```

---

### 🔌 WebSocket Events

#### Server → Client Events

##### `connection`
התחברות ראשונית.

```json
{
  "type": "connection",
  "status": "connected",
  "timestamp": 1769644000000
}
```

---

##### `session-started` (NEW)
session חדש התחיל.

```json
{
  "type": "session-started",
  "data": {
    "id": "agent:main:subagent:abc123",
    "sessionKey": "agent:main:subagent:abc123",
    "kind": "direct",
    "model": "claude-sonnet-4.5",
    "startTime": 1769644000000
  },
  "timestamp": 1769644000000
}
```

---

##### `session-updated` (NEW)
session התעדכן (tokens, status, etc).

```json
{
  "type": "session-updated",
  "data": {
    "id": "agent:main:subagent:abc123",
    "totalTokens": 5000,
    "inputTokens": 3000,
    "outputTokens": 2000,
    "lastActivity": 1769644100000
  },
  "timestamp": 1769644100000
}
```

---

##### `session-completed` (NEW)
session נגמר.

```json
{
  "type": "session-completed",
  "data": {
    "id": "agent:main:subagent:abc123",
    "status": "completed",
    "endTime": 1769644200000,
    "totalTokens": 8500,
    "duration": 200000
  },
  "timestamp": 1769644200000
}
```

---

##### `session-error` (NEW)
שגיאה ב-session.

```json
{
  "type": "session-error",
  "data": {
    "id": "agent:main:subagent:abc123",
    "error": "Connection timeout",
    "timestamp": 1769644150000
  },
  "timestamp": 1769644150000
}
```

---

##### `log-update`
log חדש נוסף.

```json
{
  "type": "log-update",
  "data": {
    "agentId": "agent-123",
    "message": "Processing completed",
    "level": "info",
    "timestamp": 1769644000000
  },
  "timestamp": 1769644000000
}
```

---

##### `agent-started` (Legacy)
agent חדש התחיל.

```json
{
  "type": "agent-started",
  "data": {
    "id": "agent-123",
    "name": "Data Analyzer",
    "status": "running"
  },
  "timestamp": 1769644000000
}
```

---

##### `agent-updated` (Legacy)
agent התעדכן.

```json
{
  "type": "agent-updated",
  "data": {
    "id": "agent-123",
    "status": "running",
    "progress": 50
  },
  "timestamp": 1769644000000
}
```

---

#### Client → Server Events

##### `ping`
שמור חיבור חי.

```json
{
  "type": "ping"
}
```

**Server Response:**
```json
{
  "type": "pong",
  "timestamp": 1769644000000
}
```

---

##### `subscribe` (NEW)
הירשם ל-updates ספציפיים.

```json
{
  "type": "subscribe",
  "channels": ["sessions", "logs", "stats"]
}
```

**Server Response:**
```json
{
  "type": "subscribed",
  "channels": ["sessions", "logs", "stats"],
  "timestamp": 1769644000000
}
```

---

## 🧪 Testing Examples

### cURL Examples

**Get Active Sessions:**
```bash
curl http://localhost:3001/api/clawdbot/sessions?active=true
```

**Get Session Details:**
```bash
curl http://localhost:3001/api/clawdbot/sessions/agent:main:subagent:8f08238d
```

**Get Stats:**
```bash
curl http://localhost:3001/api/clawdbot/stats
```

---

### JavaScript Examples

**Fetch Active Sessions:**
```javascript
const response = await fetch('http://localhost:3001/api/clawdbot/sessions?active=true');
const data = await response.json();
console.log(`Active sessions: ${data.count}`);
```

**WebSocket Connection:**
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  ws.send(JSON.stringify({ type: 'subscribe', channels: ['sessions'] }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'session-updated') {
    console.log('Session updated:', message.data);
  }
};
```

---

## 📝 Error Handling

כל ה-endpoints מחזירים errors בפורמט אחיד:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": 1769644000000
}
```

**Common Error Codes:**
- `NOT_FOUND` - Resource לא נמצא
- `VALIDATION_ERROR` - Validation נכשל
- `INTERNAL_ERROR` - שגיאת server
- `CLAWDBOT_ERROR` - שגיאה בקריאה מClawdbot

---

## 🔄 Versioning

API version מוגדר ב-headers:

```
X-API-Version: 2.0
```

Breaking changes ידרשו version bump.

---

## 📚 Rate Limiting (Future)

לא מוגבל כרגע. בעתיד:
- 100 requests/minute per IP
- 1000 requests/hour per API key

---

## 🔗 Related Documentation

- [UPGRADE_PLAN.md](./UPGRADE_PLAN.md) - תכנית שדרוג מלאה
- [ARCHITECTURE_DIAGRAM.txt](./ARCHITECTURE_DIAGRAM.txt) - ארכיטקטורה
- [README.md](./README.md) - תיעוד כללי

---

**Last Updated:** 29 ינואר 2026  
**Version:** 2.0  
**Status:** Draft - Ready for Implementation
