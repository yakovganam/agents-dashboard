# 🚀 Quick Start Guide

Get the Agents Dashboard up and running in 5 minutes!

## Step 1: Install Dependencies

### Windows
```bash
setup.bat
```

### Mac/Linux
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation
```bash
# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
cd ..
```

---

## Step 2: Start the Application

### Option A: Use Start Script

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## Step 3: Access the Dashboard

Open your browser to:
- **Dashboard:** http://localhost:3000
- **API:** http://localhost:3001/api/health

---

## Step 4: Add Test Data (Optional)

```bash
node test-data.js
```

This will create 10 sample agents with logs.

---

## Step 5: Try the Example Agent Client

```bash
node example-agent-client.js
```

This demonstrates how external agents can integrate with the dashboard.

---

## 🎯 What You'll See

1. **Sidebar (Left)**
   - List of all agents
   - Filter by status (All, Running, Completed, Errors)
   - Search functionality

2. **Main Panel (Center)**
   - Selected agent details
   - Progress bar
   - Token usage statistics
   - Control buttons (Stop/Restart)

3. **Logs Viewer (Bottom)**
   - Real-time log streaming
   - Color-coded by severity
   - Search and export features

4. **WebSocket Indicator (Top Right)**
   - 🟢 Green = Connected
   - 🔴 Red = Disconnected

---

## 📡 Integrate Your Own Agent

```javascript
const API_URL = 'http://localhost:3001';

// 1. Register your agent
await fetch(`${API_URL}/api/agents`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'my-agent-1',
    name: 'My Agent',
    model: 'gpt-4',
    task: 'Doing something cool',
    status: 'running',
    progress: 0,
    startTime: Date.now()
  })
});

// 2. Update progress
await fetch(`${API_URL}/api/agents/my-agent-1/update-status`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    progress: 50,
    tokensIn: 1000,
    tokensOut: 500
  })
});

// 3. Send logs
await fetch(`${API_URL}/api/agents/my-agent-1/logs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Processing completed',
    level: 'info'
  })
});

// 4. Mark as completed
await fetch(`${API_URL}/api/agents/my-agent-1/update-status`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'completed',
    progress: 100,
    endTime: Date.now()
  })
});
```

Or use the provided `AgentClient` class:

```javascript
const AgentClient = require('./example-agent-client.js');

const agent = new AgentClient('My Agent', 'gpt-4', 'My task');
await agent.start();
await agent.updateStatus(50, 1000, 500);
await agent.log('Working hard...', 'info');
await agent.complete(2000, 1000);
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (3001):**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### WebSocket Not Connecting

1. Make sure backend is running
2. Check browser console for errors
3. Verify WebSocket URL in frontend/.env

### No Data Showing

1. Run `node test-data.js` to add sample data
2. Check backend logs for errors
3. Open browser console to check for API errors

---

## 🚀 Next Steps

- Read the full [README.md](README.md) for deployment options
- Check [example-agent-client.js](example-agent-client.js) for integration examples
- Customize the theme in `frontend/src/App.jsx`
- Deploy to production (Railway + Cloudflare Pages)

---

## 📚 API Documentation

See [README.md](README.md) for complete API reference.

---

**Enjoy your Agents Dashboard! 🎉**
