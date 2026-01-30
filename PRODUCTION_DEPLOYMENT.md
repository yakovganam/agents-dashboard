# 🚀 Agents Dashboard - Deployment Guide

**Project:** https://github.com/yakovganam/agents-dashboard  
**Status:** ✅ Production Ready  
**Live Dashboard:** https://agents-dashboard-frontend.netlify.app  
**Backend API:** https://agents-dashboard-backend.onrender.com

---

## 📊 Real-Time Features

✅ **Live Session Tracking**
- Real-time monitoring of Clawdbot sessions
- Session status (running/idle)
- Updated every 5-10 seconds via polling + WebSocket

✅ **Token Usage & Cost Tracking**
- Tracks input/output tokens per session
- Calculates cost based on model (Claude, GPT, Gemini pricing)
- Total cost aggregation

✅ **Live Agent Logs**
- Streams session logs in real-time
- JSONL format support
- Search and filter capabilities

✅ **WebSocket Real-Time Updates**
- Bi-directional WebSocket communication
- Auto-reconnect on disconnect
- Live event broadcasting

---

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Framework:** Express.js
- **Real-Time:** WebSocket (ws)
- **Database:** SQLite (local) + File-based bridge to Clawdbot
- **Data Source:** `~/.clawdbot/agents/main/sessions/sessions.json`

### Frontend (React + Vite)
- **Framework:** React 18 + Vite
- **UI:** Material-UI + Tailwind CSS
- **State:** React hooks (useWebSocket, useClawdbotSessions)
- **Polling:** 10-second refresh interval

### Clawdbot Integration
- **Bridge:** Reads from local Clawdbot agent sessions
- **Metrics Extracted:**
  - Session ID, model, channel
  - Input/output tokens
  - Cost calculation
  - Session logs (JSONL)
  - Status (running/idle)

---

## 🚀 Quick Deploy to Render

### 1. Backend Deployment

```bash
# Already deployed: https://agents-dashboard-backend.onrender.com
# To redeploy:

cd backend

# Build and push to Render
render deploy --name agents-dashboard-backend
```

**Environment Variables (Render):**
```
PORT=3001
NODE_ENV=production
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

### 2. Frontend Deployment

```bash
# Already deployed: https://agents-dashboard-frontend.netlify.app
# To redeploy:

cd frontend

# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

**Environment Variables (Netlify):**
```
VITE_API_URL=https://agents-dashboard-backend.onrender.com
VITE_WS_URL=wss://agents-dashboard-backend.onrender.com
```

---

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone repo
git clone https://github.com/yakovganam/agents-dashboard.git
cd agents-dashboard

# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

**Local URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- WebSocket: ws://localhost:3001

---

## 📡 API Endpoints

### Clawdbot Sessions

```
GET  /api/clawdbot/sessions              # All sessions
GET  /api/clawdbot/sessions/active       # Active sessions
GET  /api/clawdbot/sessions/:id          # Specific session
GET  /api/clawdbot/sessions/:id/logs     # Session logs
POST /api/clawdbot/sessions/:id/kill     # Kill session
POST /api/clawdbot/sessions/:id/restart  # Restart session
GET  /api/clawdbot/stats                 # Overall statistics
GET  /api/clawdbot/health                # Health check
```

### Health & Status

```
GET  /api/health                         # Backend health
GET  /api/telemetry/status              # Telemetry status
```

---

## 🔌 WebSocket Events

**From Server:**
```javascript
{
  type: 'session-started',      // New session created
  type: 'session-updated',      // Session updated
  type: 'session-completed',    // Session finished
  type: 'log-update',           // New log entry
  type: 'stats-updated'         // Statistics updated
}
```

**From Client:**
```javascript
{
  type: 'ping'                  // Keep-alive ping
}
```

---

## 📦 Docker Deployment

### Local Docker Testing

```bash
# Build and run with Docker Compose
docker-compose up -d

# Services:
# - Backend: http://localhost:3001
# - Frontend: http://localhost:3000

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Cloud Docker (Railway, Fly.io)

```bash
# Deploy to Railway
railway up

# Or Fly.io
flyctl deploy
```

---

## ✅ Deployment Checklist

### Before Deployment
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Clawdbot bridge tested locally
- [ ] WebSocket connection verified
- [ ] Frontend build successful

### Deployment Steps
- [ ] Push to GitHub
- [ ] Render auto-deploys backend (via webhook)
- [ ] Update frontend .env with production URLs
- [ ] Deploy frontend to Netlify
- [ ] Verify live data flow
- [ ] Test WebSocket connectivity
- [ ] Monitor error logs

### Post-Deployment
- [ ] Health check: `GET /api/health`
- [ ] Frontend loads: `https://agents-dashboard-frontend.netlify.app`
- [ ] WebSocket connects: Check browser console
- [ ] Data updates: Verify 5-10 second refresh
- [ ] Clawdbot sessions visible: Check session cards

---

## 🔒 Production Considerations

### Current State
- ✅ No authentication (open access - suitable for internal use)
- ✅ CORS enabled for frontend
- ✅ SQLite database (local)
- ✅ File-based session reading

### Recommended for Production
1. **Add Authentication**
   - API key validation
   - JWT tokens for WebSocket
   - Role-based access control

2. **Database**
   - PostgreSQL for cloud scaling
   - Persistent session caching
   - Backup and recovery

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring (DataDog)
   - Log aggregation (ELK)

4. **Security**
   - HTTPS/WSS only
   - Rate limiting
   - Input validation
   - CSRF protection

---

## 🐛 Troubleshooting

### WebSocket Not Connecting
```javascript
// Check browser console for errors
// Verify backend is running
// Check firewall/proxy settings
// Ensure correct URL scheme (ws:// or wss://)
```

### No Session Data Appearing
```bash
# Verify Clawdbot path
ls ~/.clawdbot/agents/main/sessions/sessions.json

# Check bridge directly
node -e "require('./backend/clawdbot/bridge').initialize().then(() => require('./backend/clawdbot/bridge').getStatistics().then(s => console.log(JSON.stringify(s, null, 2))))"
```

### Port Already in Use
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
rm backend/agents.db
node backend/db/database.js
```

---

## 📚 Documentation

- **API Spec:** `API_SPEC.md`
- **Architecture:** `ARCHITECTURE_DIAGRAM.txt`
- **Quickstart:** `QUICKSTART.md`
- **Completion Status:** `COMPLETION.md`

---

## 🔗 Resources

- **GitHub:** https://github.com/yakovganam/agents-dashboard
- **Live Frontend:** https://agents-dashboard-frontend.netlify.app
- **Live Backend:** https://agents-dashboard-backend.onrender.com
- **Render Dashboard:** https://dashboard.render.com
- **Netlify Dashboard:** https://app.netlify.com

---

## 📧 Support

For issues or questions, open an issue on GitHub or check the deployment logs.

---

**Last Updated:** 2026-01-30  
**Status:** ✅ Production Ready  
**Maintainer:** yakovganam
