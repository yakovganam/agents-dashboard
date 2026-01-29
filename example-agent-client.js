/**
 * Example Agent Client
 * 
 * This demonstrates how an external agent/application can:
 * 1. Register itself with the dashboard
 * 2. Send status updates
 * 3. Send log messages
 * 4. Handle completion/errors
 */

const API_URL = 'http://localhost:3001';

class AgentClient {
  constructor(name, model, task) {
    this.id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.model = model;
    this.task = task;
    this.apiUrl = API_URL;
  }

  /**
   * Register the agent with the dashboard
   */
  async start() {
    try {
      const response = await fetch(`${this.apiUrl}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: this.id,
          name: this.name,
          model: this.model,
          task: this.task,
          status: 'running',
          progress: 0,
          startTime: Date.now(),
          tokensIn: 0,
          tokensOut: 0
        })
      });

      if (response.ok) {
        console.log(`✅ Agent ${this.name} registered successfully`);
        await this.log('Agent started', 'info');
        return true;
      } else {
        console.error('Failed to register agent');
        return false;
      }
    } catch (error) {
      console.error('Error starting agent:', error);
      return false;
    }
  }

  /**
   * Update agent status and progress
   */
  async updateStatus(progress, tokensIn = 0, tokensOut = 0) {
    try {
      const response = await fetch(`${this.apiUrl}/api/agents/${this.id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'running',
          progress: Math.min(100, Math.max(0, progress)),
          tokensIn,
          tokensOut
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }

  /**
   * Send a log message
   */
  async log(message, level = 'info') {
    try {
      const response = await fetch(`${this.apiUrl}/api/agents/${this.id}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          level // info, warning, error, debug
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending log:', error);
      return false;
    }
  }

  /**
   * Mark agent as completed
   */
  async complete(tokensIn = 0, tokensOut = 0) {
    try {
      await this.log('Task completed successfully', 'info');
      
      const response = await fetch(`${this.apiUrl}/api/agents/${this.id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          progress: 100,
          endTime: Date.now(),
          tokensIn,
          tokensOut
        })
      });

      console.log(`✅ Agent ${this.name} completed`);
      return response.ok;
    } catch (error) {
      console.error('Error completing agent:', error);
      return false;
    }
  }

  /**
   * Mark agent as failed
   */
  async error(errorMessage) {
    try {
      await this.log(`Error: ${errorMessage}`, 'error');
      
      const response = await fetch(`${this.apiUrl}/api/agents/${this.id}/update-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'error',
          endTime: Date.now()
        })
      });

      console.log(`❌ Agent ${this.name} failed: ${errorMessage}`);
      return response.ok;
    } catch (error) {
      console.error('Error setting error status:', error);
      return false;
    }
  }

  /**
   * Simulate agent work with progress updates
   */
  async simulateWork(durationMs = 10000) {
    const steps = 10;
    const stepDuration = durationMs / steps;
    
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      const progress = (i / steps) * 100;
      const tokensIn = Math.floor(Math.random() * 1000) + (i * 500);
      const tokensOut = Math.floor(Math.random() * 500) + (i * 250);
      
      await this.updateStatus(progress, tokensIn, tokensOut);
      await this.log(`Processing step ${i}/${steps} (${Math.floor(progress)}%)`, 'info');
      
      // Random warning
      if (Math.random() > 0.8) {
        await this.log('High memory usage detected', 'warning');
      }
    }
  }
}

// ============================================
// USAGE EXAMPLES
// ============================================

async function example1_BasicUsage() {
  console.log('\n📝 Example 1: Basic Usage\n');
  
  const agent = new AgentClient(
    'Data Analyzer',
    'gpt-4',
    'Analyzing customer feedback data'
  );

  // Start agent
  await agent.start();
  
  // Update progress
  await agent.updateStatus(25, 1000, 500);
  await agent.log('Data loaded successfully', 'info');
  
  await agent.updateStatus(50, 2000, 1000);
  await agent.log('Processing data...', 'info');
  
  await agent.updateStatus(75, 3000, 1500);
  await agent.log('Generating insights', 'info');
  
  // Complete
  await agent.complete(4000, 2000);
}

async function example2_SimulatedWork() {
  console.log('\n🤖 Example 2: Simulated Work\n');
  
  const agent = new AgentClient(
    'Content Generator',
    'claude-3',
    'Generating marketing content for product launch'
  );

  await agent.start();
  await agent.simulateWork(15000); // 15 seconds of work
  await agent.complete(5000, 2500);
}

async function example3_ErrorHandling() {
  console.log('\n⚠️ Example 3: Error Handling\n');
  
  const agent = new AgentClient(
    'Translation Bot',
    'gpt-3.5-turbo',
    'Translating technical documentation'
  );

  await agent.start();
  await agent.updateStatus(20, 500, 250);
  await agent.log('Starting translation...', 'info');
  
  // Simulate error
  await agent.log('API rate limit exceeded', 'warning');
  await agent.error('Translation API unavailable');
}

async function example4_MultipleAgents() {
  console.log('\n🚀 Example 4: Multiple Agents\n');
  
  const agents = [
    new AgentClient('Agent Alpha', 'gpt-4', 'Task A'),
    new AgentClient('Agent Beta', 'claude-3', 'Task B'),
    new AgentClient('Agent Gamma', 'gpt-3.5-turbo', 'Task C')
  ];

  // Start all agents
  for (const agent of agents) {
    await agent.start();
  }

  // Run them in parallel
  await Promise.all(
    agents.map(agent => agent.simulateWork(8000))
  );

  // Complete all
  for (const agent of agents) {
    await agent.complete(3000, 1500);
  }
}

// ============================================
// RUN EXAMPLES
// ============================================

async function main() {
  console.log('🎯 Agent Client Examples\n');
  console.log('Make sure the backend is running on http://localhost:3001\n');

  try {
    // Check if backend is available
    const healthCheck = await fetch(`${API_URL}/api/health`);
    if (!healthCheck.ok) throw new Error('Backend not available');

    console.log('✅ Backend is running\n');
    console.log('Choose an example to run:\n');
    console.log('Uncomment one of the following:\n');

    // Uncomment ONE of these to run:
    
    // await example1_BasicUsage();
    // await example2_SimulatedWork();
    // await example3_ErrorHandling();
    await example4_MultipleAgents(); // Default

    console.log('\n✨ Done! Check the dashboard at http://localhost:3000\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Make sure the backend is running: cd backend && npm run dev\n');
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use in other scripts
module.exports = AgentClient;
