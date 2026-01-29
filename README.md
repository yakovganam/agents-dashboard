# Agents Dashboard

Full-featured dashboard for managing AI agents with real-time updates, live logs, and WebSocket communication.

## 🚀 Features

### Backend
- **Express.js REST API** - Full CRUD operations for agents
- **WebSocket Server** - Real-time bidirectional communication
- **SQLite Database** - Persistent storage for agents and logs
- **Live Updates** - Broadcasting agent status changes and logs

### Frontend
- **React 18** - Modern UI with hooks
- **Material-UI** - Professional dark theme
- **Real-time Dashboard** - Live agent status and progress
- **Log Viewer** - Streaming logs with search and export
- **Responsive Design** - Works on desktop, tablet, and mobile

### Key Features
- ✅ Live agent tracking with progress bars
- ✅ Real-time log streaming
- ✅ Agent control (start/stop/kill/restart)
- ✅ Filter and search agents
- ✅ Export logs to file
- ✅ WebSocket auto-reconnect
- ✅ Status indicators with animations
- ✅ Analytics and statistics

---

## 📋 Requirements

- **Node.js** 18+ 
- **npm** or **yarn**
- **SQLite3** (included)

---

## 🛠️ Installation

### 1. Clone or Extract

```bash
cd agents-dashboard
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 🏃 Running Locally

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend will run on: **http://localhost:3001**  
WebSocket: **ws://localhost:3001**

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will run on: **http://localhost:3000**

---

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
docker-compose up -d
```

Services:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### Stop Services

```bash
docker-compose down
```

---

## 📡 API Endpoints

### Agents

- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get specific agent
- `POST /api/agents` - Create new agent
- `POST /api/agents/:id/update-status` - Update agent status
- `POST /api/agents/:id/control` - Control agent (start/stop/kill/restart)
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/stats` - Get dashboard statistics

### Logs

- `GET /api/agents/:id/logs` - Get agent logs
- `POST /api/agents/:id/logs` - Add log entry
- `DELETE /api/agents/:id/logs` - Clear agent logs
- `GET /api/agents/:id/logs/export` - Export logs as text file

### Health

- `GET /api/health` - Health check

---

## 🔌 WebSocket Events

### Server → Client

- `connection` - Initial connection confirmation
- `agent-started` - New agent started
- `agent-updated` - Agent status/progress updated
- `agent-completed` - Agent finished successfully
- `agent-error` - Agent encountered error
- `log-update` - New log entry added
- `logs-cleared` - Logs cleared for agent

### Client → Server

- `ping` - Keep-alive ping (server responds with `pong`)

---

## 🗄️ Database Schema

### Agents Table

```sql
CREATE TABLE agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    label TEXT,
    model TEXT NOT NULL,
    task TEXT,
    status TEXT NOT NULL CHECK(status IN ('pending', 'running', 'completed', 'error')),
    progress INTEGER DEFAULT 0 CHECK(progress >= 0 AND progress <= 100),
    startTime INTEGER,
    endTime INTEGER,
    tokensIn INTEGER DEFAULT 0,
    tokensOut INTEGER DEFAULT 0,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
```

### Logs Table

```sql
CREATE TABLE logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agentId TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('info', 'warning', 'error', 'debug')),
    FOREIGN KEY (agentId) REFERENCES agents(id) ON DELETE CASCADE
);
```

---

## 🎯 Usage Example

### Create a New Agent (API)

```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "id": "agent-123",
    "name": "My Agent",
    "model": "gpt-4",
    "task": "Analyze data",
    "status": "running",
    "progress": 0,
    "startTime": 1234567890000
  }'
```

### Update Agent Status

```bash
curl -X POST http://localhost:3001/api/agents/agent-123/update-status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "running",
    "progress": 50,
    "tokensIn": 1000,
    "tokensOut": 500
  }'
```

### Add Log Entry

```bash
curl -X POST http://localhost:3001/api/agents/agent-123/logs \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Processing completed",
    "level": "info"
  }'
```

---

## 🚀 Deployment to Production

### Deploy Backend (Railway/Render)

1. Create new project on Railway or Render
2. Connect your repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `PORT=3001` (or Railway's auto port)
   - `NODE_ENV=production`

### Deploy Frontend (Cloudflare Pages)

1. Create new Cloudflare Pages project
2. Connect your repository
3. Set build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output**: `frontend/dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend-url.com`
   - `VITE_WS_URL=wss://your-backend-url.com`

---

## 🎨 Customization

### Change Theme

Edit `frontend/src/App.jsx`:

```javascript
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2196f3' }, // Change primary color
    secondary: { main: '#f50057' }, // Change secondary color
  },
});
```

### Add New Status

1. Update database schema in `backend/db/schema.sql`
2. Add color in `frontend/src/components/StatusIndicator.jsx`
3. Add status handling in controllers

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux

# Kill process using port
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

### Frontend can't connect to backend

1. Check backend is running on port 3001
2. Verify CORS is enabled in backend
3. Check `.env` file in frontend
4. Open browser console for errors

### WebSocket not connecting

1. Verify backend WebSocket server is initialized
2. Check firewall settings
3. Ensure correct WebSocket URL (ws:// or wss://)

---

## 📂 Project Structure

```
agents-dashboard/
├── backend/
│   ├── server.js              # Main server file
│   ├── websocket.js           # WebSocket server
│   ├── package.json
│   ├── routes/
│   │   ├── agents.js          # Agent routes
│   │   └── logs.js            # Log routes
│   ├── controllers/
│   │   ├── agentController.js # Agent logic
│   │   └── logController.js   # Log logic
│   └── db/
│       ├── database.js        # Database interface
│       └── schema.sql         # SQL schema
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MainPanel.jsx
│   │   │   ├── AgentCard.jsx
│   │   │   ├── LogsViewer.jsx
│   │   │   └── StatusIndicator.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

---

## 📝 License

MIT

---

## 🙏 Credits

Built with:
- [Express.js](https://expressjs.com/)
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)
- [ws](https://github.com/websockets/ws)
- [SQLite](https://www.sqlite.org/)

---

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the maintainer.

---

**Happy agent managing! 🤖✨**
