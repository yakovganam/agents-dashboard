# 🚀 Agents Dashboard - תכנית שדרוג מלאה

**סטטוס נוכחי:** Dashboard מבוסס sample data  
**יעד:** Dashboard חי עם נתונים אמיתיים מ-Clawdbot  
**תאריך:** 29 ינואר 2026

---

## 📊 ניתוח המצב הנוכחי

### ✅ מה קיים:
- Backend Express.js + SQLite + WebSocket
- Frontend React + Material-UI
- API endpoints מלאים (CRUD agents, logs)
- WebSocket real-time communication
- UI מעוצב עם progress bars וסטטוסים

### ❌ מה חסר:
- **אין חיבור ל-Clawdbot** - Dashboard לא רואה סוכנים אמיתיים
- **אין data source אמיתי** - רק test data מקובע
- **אין real-time updates** מ-Clawdbot
- **אין webhook integration** - Clawdbot לא מדווח ל-Dashboard
- **אין session tracking** - לא רואים היסטוריית sessions

---

## 🎯 אסטרטגיית השדרוג

### Phase 1: Clawdbot Integration (חיוני) 🔴
**משך זמן:** 1-2 ימים  
**עדיפות:** גבוהה ביותר

#### 1.1 Backend Bridge Layer
צור שכבת גישור בין Dashboard ל-Clawdbot:

```javascript
// backend/clawdbot/bridge.js
class ClawdbotBridge {
  constructor() {
    this.sessionStore = null;
    this.pollInterval = 5000; // 5 seconds
  }

  async initialize() {
    // קרא את session store path מ-Clawdbot
    // ~/.clawdbot/agents/main/sessions/sessions.json
  }

  async getActiveSessions() {
    // קרא sessions.json
    // סנן sessions פעילים (updatedAt < 5 min)
    return sessions;
  }

  async getSessionDetails(sessionId) {
    // קרא פרטי session ספציפי
    // כולל היסטוריית הודעות
  }

  async watchSessions(callback) {
    // Poll או watch file changes
    // קרא לcallback כש-session משתנה
  }
}
```

**קבצים לעדכן:**
- `backend/clawdbot/bridge.js` (חדש)
- `backend/clawdbot/config.js` (חדש) - קריאת Clawdbot config
- `backend/clawdbot/parser.js` (חדש) - פרסור sessions.json

#### 1.2 API Endpoints חדשים

```javascript
// backend/routes/clawdbot.js (חדש)

// קבל כל ה-sessions הפעילים
GET /api/clawdbot/sessions
Response: [
  {
    id: "agent:main:subagent:8f08...",
    kind: "direct",
    model: "claude-sonnet-4.5",
    inputTokens: 4586,
    outputTokens: 1107,
    totalTokens: 62938,
    updatedAt: 1769644017740,
    isActive: true
  }
]

// קבל session ספציפי
GET /api/clawdbot/sessions/:sessionId

// קבל logs של session
GET /api/clawdbot/sessions/:sessionId/logs

// סטטיסטיקות כלליות
GET /api/clawdbot/stats
Response: {
  totalSessions: 16,
  activeSessions: 5,
  totalTokensToday: 125000,
  activeModels: ["claude-sonnet-4.5", "gpt-5"],
  avgSessionDuration: 180000
}
```

**קבצים לעדכן:**
- `backend/routes/clawdbot.js` (חדש)
- `backend/controllers/clawdbotController.js` (חדש)

#### 1.3 Real-time Polling/Watching

```javascript
// backend/watchers/sessionWatcher.js (חדש)

class SessionWatcher {
  constructor(bridge, websocket) {
    this.bridge = bridge;
    this.websocket = websocket;
    this.lastState = new Map();
  }

  start() {
    setInterval(() => this.poll(), 3000);
  }

  async poll() {
    const sessions = await this.bridge.getActiveSessions();
    
    sessions.forEach(session => {
      const lastKnown = this.lastState.get(session.id);
      
      if (!lastKnown) {
        // Session חדש התחיל
        this.websocket.broadcastEvent('session-started', session);
      } else if (session.updatedAt > lastKnown.updatedAt) {
        // Session התעדכן
        this.websocket.broadcastEvent('session-updated', session);
      }
      
      this.lastState.set(session.id, session);
    });
    
    // בדוק sessions שנעלמו (נגמרו)
    this.checkCompletedSessions(sessions);
  }
}
```

**קבצים לעדכן:**
- `backend/watchers/sessionWatcher.js` (חדש)
- `backend/server.js` - אתחול SessionWatcher

#### 1.4 Webhook Support (אופציונלי)

אם Clawdbot תומך בwebhooks בעתיד:

```javascript
// backend/routes/webhooks.js (חדש)

POST /api/webhooks/clawdbot
Body: {
  event: "session.started" | "session.updated" | "session.completed",
  session: { ... },
  timestamp: 1769644017740
}
```

---

### Phase 2: Database Schema Update 🟡
**משך זמן:** 4 שעות  
**עדיפות:** בינונית-גבוהה

#### 2.1 טבלת Sessions חדשה

```sql
-- backend/db/migrations/002_add_sessions.sql

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    sessionKey TEXT NOT NULL,
    kind TEXT NOT NULL CHECK(kind IN ('direct', 'group')),
    model TEXT,
    contextTokens INTEGER,
    inputTokens INTEGER DEFAULT 0,
    outputTokens INTEGER DEFAULT 0,
    totalTokens INTEGER DEFAULT 0,
    startTime INTEGER,
    lastActivity INTEGER,
    endTime INTEGER,
    status TEXT DEFAULT 'running' CHECK(status IN ('running', 'completed', 'error', 'idle')),
    aborted BOOLEAN DEFAULT 0,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_lastActivity ON sessions(lastActivity);
CREATE INDEX idx_sessions_model ON sessions(model);
```

#### 2.2 טבלת Session Messages

```sql
CREATE TABLE IF NOT EXISTS session_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT,
    tokens INTEGER,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (sessionId) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session ON session_messages(sessionId, timestamp);
```

#### 2.3 Migration Script

```javascript
// backend/db/migrations/migrate.js

const migrations = [
  { version: 1, file: '001_initial_schema.sql' },
  { version: 2, file: '002_add_sessions.sql' }
];

async function runMigrations(db) {
  // קרא current version
  // רוץ migrations שחסרים
  // עדכן version table
}
```

**קבצים לעדכן:**
- `backend/db/migrations/002_add_sessions.sql` (חדש)
- `backend/db/database.js` - הוסף migration support

---

### Phase 3: UI/UX שדרוג 🟢
**משך זמן:** 1 יום  
**עדיפות:** בינונית

#### 3.1 Session View חדש

```jsx
// frontend/src/components/SessionCard.jsx (חדש)

export function SessionCard({ session }) {
  const isActive = Date.now() - session.lastActivity < 5 * 60 * 1000;
  
  return (
    <Card>
      <CardHeader
        avatar={<ModelIcon model={session.model} />}
        title={formatSessionName(session.sessionKey)}
        subheader={
          <Box>
            <Chip 
              label={session.kind} 
              size="small" 
              color={session.kind === 'direct' ? 'primary' : 'secondary'}
            />
            <Chip 
              label={isActive ? '🟢 Active' : '⏸️ Idle'} 
              size="small"
            />
          </Box>
        }
      />
      
      <CardContent>
        {/* Token Usage Progress */}
        <ProgressBar 
          label="Context Usage"
          value={session.totalTokens}
          max={session.contextTokens}
          color="warning"
        />
        
        {/* Stats Grid */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Stat label="Input" value={session.inputTokens} />
          </Grid>
          <Grid item xs={4}>
            <Stat label="Output" value={session.outputTokens} />
          </Grid>
          <Grid item xs={4}>
            <Stat label="Total" value={session.totalTokens} />
          </Grid>
        </Grid>
        
        {/* Timeline */}
        <Typography variant="caption">
          Started: {formatTime(session.startTime)}
          Last activity: {formatRelativeTime(session.lastActivity)}
        </Typography>
      </CardContent>
      
      <CardActions>
        <Button onClick={() => viewDetails(session.id)}>
          View Details
        </Button>
        <Button onClick={() => viewLogs(session.id)}>
          Logs
        </Button>
      </CardActions>
    </Card>
  );
}
```

#### 3.2 Dashboard Analytics

```jsx
// frontend/src/components/DashboardStats.jsx

export function DashboardStats({ stats }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={<PlayArrowIcon />}
          color="success"
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <StatCard
          title="Total Tokens Today"
          value={formatNumber(stats.totalTokensToday)}
          icon={<TokenIcon />}
          color="primary"
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <StatCard
          title="Avg Session Time"
          value={formatDuration(stats.avgSessionDuration)}
          icon={<TimerIcon />}
          color="info"
        />
      </Grid>
      
      <Grid item xs={12} md={3}>
        <StatCard
          title="Models in Use"
          value={stats.activeModels.length}
          icon={<CategoryIcon />}
          color="secondary"
        />
      </Grid>
    </Grid>
  );
}
```

#### 3.3 Real-time Updates Hook

```jsx
// frontend/src/hooks/useClawdbotSessions.js

export function useClawdbotSessions() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const { connected, subscribe } = useWebSocket();
  
  useEffect(() => {
    // Initial fetch
    fetchSessions();
    fetchStats();
    
    // Subscribe to WebSocket updates
    if (connected) {
      subscribe('session-started', handleSessionStarted);
      subscribe('session-updated', handleSessionUpdated);
      subscribe('session-completed', handleSessionCompleted);
    }
    
    // Poll fallback every 10 seconds
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [connected]);
  
  return { sessions, stats, loading, error };
}
```

**קבצים לעדכן:**
- `frontend/src/components/SessionCard.jsx` (חדש)
- `frontend/src/components/DashboardStats.jsx` (חדש)
- `frontend/src/hooks/useClawdbotSessions.js` (חדש)
- `frontend/src/pages/Dashboard.jsx` - שילוב sessions

---

### Phase 4: Advanced Features 🔵
**משך זמן:** 2 ימים  
**עדיפות:** נמוכה (nice to have)

#### 4.1 Session Details View
- צפייה מלאה בהיסטוריית שיחה
- Syntax highlighting למסרים
- Copy/export conversation
- Token breakdown per message

#### 4.2 Analytics Dashboard
- Graphs: tokens over time
- Model usage distribution
- Peak hours heatmap
- Cost estimation (if pricing available)

#### 4.3 Filters & Search
- חיפוש sessions לפי model/kind/date
- סינון לפי status
- מיון לפי tokens/duration
- Export filtered results

#### 4.4 Notifications
- Browser notifications כש-session מסתיים
- Alert על שגיאות
- Daily summary

---

## 📋 Implementation Roadmap

### Week 1: Core Integration

#### Day 1-2: Backend Foundation
- [ ] צור ClawdbotBridge class
- [ ] הוסף config reader (.clawdbot path)
- [ ] הוסף sessions.json parser
- [ ] בנה SessionWatcher
- [ ] צור API endpoints חדשים
- [ ] הוסף database migrations
- [ ] **Test:** וודא שBackend קורא sessions מClawdbot

#### Day 3-4: Frontend Integration
- [ ] צור SessionCard component
- [ ] הוסף DashboardStats component
- [ ] בנה useClawdbotSessions hook
- [ ] שדרג Dashboard page
- [ ] הוסף WebSocket handlers
- [ ] **Test:** וודא שUI מראה sessions אמיתיים

#### Day 5: Testing & Polish
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] Documentation
- [ ] **Deploy:** הפעל production build

### Week 2: Advanced Features (אופציונלי)

#### Day 6-7: Enhanced UI
- [ ] Session details view
- [ ] Message history viewer
- [ ] Advanced filters
- [ ] Export functionality

#### Day 8-9: Analytics
- [ ] Charts & graphs
- [ ] Cost tracking
- [ ] Performance metrics
- [ ] Historical data

#### Day 10: Final Polish
- [ ] Bug fixes
- [ ] Performance tuning
- [ ] User feedback
- [ ] Release v2.0

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// backend/tests/clawdbot/bridge.test.js
describe('ClawdbotBridge', () => {
  it('should parse sessions.json correctly', async () => {
    const bridge = new ClawdbotBridge();
    const sessions = await bridge.getActiveSessions();
    expect(sessions).toBeArray();
    expect(sessions[0]).toHaveProperty('id');
  });
  
  it('should detect new sessions', async () => {
    // Test session detection logic
  });
});
```

### Integration Tests
```javascript
// backend/tests/integration/sessions.test.js
describe('Sessions API', () => {
  it('GET /api/clawdbot/sessions should return active sessions', async () => {
    const response = await request(app).get('/api/clawdbot/sessions');
    expect(response.status).toBe(200);
    expect(response.body).toBeArray();
  });
});
```

### E2E Tests
```javascript
// Use Playwright or Cypress
describe('Dashboard E2E', () => {
  it('should show live sessions when Clawdbot is running', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.session-card');
    const count = await page.locator('.session-card').count();
    expect(count).toBeGreaterThan(0);
  });
});
```

---

## 📊 Success Metrics

### Must Have (Week 1):
- ✅ Dashboard מראה סוכנים אמיתיים מClawdbot
- ✅ Real-time updates (תוך 5 שניות)
- ✅ Token usage tracking
- ✅ Model distribution
- ✅ Active/idle status

### Nice to Have (Week 2):
- ✅ Session history viewer
- ✅ Analytics charts
- ✅ Export functionality
- ✅ Browser notifications
- ✅ Cost estimation

---

## 🚨 Risk Management

### גבוה - Clawdbot API Changes
**בעיה:** Clawdbot עלול לשנות מבנה sessions.json  
**פתרון:** 
- גרסה schema validation
- Backward compatibility layer
- Error handling graceful

### בינוני - Performance
**בעיה:** Polling כל 3 שניות עלול להכביד  
**פתרון:**
- Cache results
- Incremental updates only
- Configurable poll interval

### נמוך - WebSocket Stability
**בעיה:** WebSocket disconnects  
**פתרון:**
- Auto-reconnect logic (כבר קיים)
- Fallback to polling
- Connection status indicator

---

## 📚 Documentation Updates

צריך לעדכן:
1. `README.md` - הוסף Clawdbot integration section
2. `API_SPEC.md` - תיעוד endpoints חדשים (ראה קובץ נפרד)
3. `ARCHITECTURE_DIAGRAM.txt` - ארכיטקטורה מעודכנת (ראה קובץ נפרד)
4. `DEPLOYMENT.md` - הוראות deployment מעודכנות

---

## 🎯 Expected Results

### Before:
```
Dashboard:
├── Sample data only
├── No Clawdbot connection
├── Manual agent creation
└── Static updates
```

### After:
```
Dashboard:
├── Live Clawdbot sessions ✅
├── Real-time updates (3-5s) ✅
├── Automatic detection ✅
├── Token tracking ✅
├── Model analytics ✅
└── WebSocket streaming ✅
```

---

## 💡 Future Enhancements

### Phase 5 (Future):
- **Multi-agent support** - צפייה במספר agents בו-זמנית
- **Clawdbot Control Panel** - התחלה/עצירה של sessions
- **Memory viewer** - צפייה בזיכרון של agents
- **Tool call tracking** - מעקב אחר tool invocations
- **Cost optimization** - המלצות להורדת עלויות
- **A/B testing** - השוואת models/prompts

---

## 📞 Support & Resources

- **Clawdbot Docs:** https://docs.clawd.bot/
- **Clawdbot CLI:** `clawdbot --help`
- **Sessions API:** `clawdbot sessions --json`
- **ACP Protocol:** `clawdbot acp --help`

---

**תאריך יצירה:** 29 ינואר 2026  
**גרסה:** 1.0  
**מחבר:** AI Assistant (Subagent)  
**סטטוס:** Ready for Implementation 🚀
