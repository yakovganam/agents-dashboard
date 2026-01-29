// Test script to create sample agents and logs
// Run with: node test-data.js

const API_URL = 'http://localhost:3001';

const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'claude-2'];
const statuses = ['running', 'completed', 'error', 'pending'];
const tasks = [
  'Analyzing customer sentiment from reviews',
  'Generating product descriptions',
  'Processing financial reports',
  'Translating documentation',
  'Creating marketing content'
];

async function createAgent(index) {
  const agent = {
    id: `agent-${Date.now()}-${index}`,
    name: `Agent ${index + 1}`,
    label: `Test Agent ${index + 1}`,
    model: models[Math.floor(Math.random() * models.length)],
    task: tasks[Math.floor(Math.random() * tasks.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    progress: Math.floor(Math.random() * 100),
    startTime: Date.now() - Math.floor(Math.random() * 3600000),
    tokensIn: Math.floor(Math.random() * 10000),
    tokensOut: Math.floor(Math.random() * 5000)
  };

  if (agent.status === 'completed') {
    agent.endTime = Date.now();
    agent.progress = 100;
  }

  try {
    const response = await fetch(`${API_URL}/api/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent)
    });

    if (response.ok) {
      const created = await response.json();
      console.log(`✅ Created agent: ${created.name} (${created.id})`);
      
      // Add some logs
      await addLogs(created.id);
      
      return created;
    } else {
      console.error(`❌ Failed to create agent ${index + 1}`);
    }
  } catch (error) {
    console.error(`❌ Error creating agent ${index + 1}:`, error.message);
  }
}

async function addLogs(agentId) {
  const logMessages = [
    { message: 'Agent initialization started', level: 'info' },
    { message: 'Loading model...', level: 'info' },
    { message: 'Model loaded successfully', level: 'info' },
    { message: 'Processing input data', level: 'info' },
    { message: 'Warning: High token usage detected', level: 'warning' },
    { message: 'Checkpoint saved', level: 'info' },
    { message: 'Progress: 50%', level: 'info' },
    { message: 'Analyzing results...', level: 'info' },
    { message: 'Task completed successfully', level: 'info' }
  ];

  for (const log of logMessages) {
    try {
      await fetch(`${API_URL}/api/agents/${agentId}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log)
      });
      
      // Small delay between logs
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error adding log:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Creating test agents...\n');

  const agentCount = 10;
  
  for (let i = 0; i < agentCount; i++) {
    await createAgent(i);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Created ${agentCount} test agents with logs!`);
  console.log(`🌐 View dashboard at: http://localhost:3000`);
}

// Check if server is running
fetch(`${API_URL}/api/health`)
  .then(() => main())
  .catch(() => {
    console.error('❌ Backend server is not running!');
    console.error('Please start the backend first with: cd backend && npm run dev');
  });
