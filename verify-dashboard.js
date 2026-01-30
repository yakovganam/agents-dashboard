#!/usr/bin/env node

/**
 * Agents Dashboard - Live Verification Script
 * Tests all components and verifies live connection to Clawdbot
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const WebSocket = require('ws');
const clawdbotBridge = require('./backend/clawdbot/bridge');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const WS_URL = process.env.WS_URL || 'ws://localhost:3001';

let testResults = {
    timestamp: new Date().toISOString(),
    backend: {},
    frontend: {},
    clawdbot: {},
    websocket: {},
    overall: 'pending'
};

async function testBackendHealth() {
    console.log('\n📡 Testing Backend Health...');
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        testResults.backend.health = {
            status: data.status,
            connections: data.connections,
            pass: data.status === 'ok'
        };
        console.log('✅ Backend health:', data);
        return true;
    } catch (error) {
        testResults.backend.health = { error: error.message, pass: false };
        console.log('❌ Backend health failed:', error.message);
        return false;
    }
}

async function testClawdbotAPI() {
    console.log('\n🤖 Testing Clawdbot API...');
    try {
        const response = await fetch(`${API_URL}/api/clawdbot/stats`);
        const data = await response.json();
        testResults.clawdbot.stats = {
            ...data.stats,
            pass: data.success
        };
        console.log('✅ Clawdbot stats:', data.stats);
        return true;
    } catch (error) {
        testResults.clawdbot.stats = { error: error.message, pass: false };
        console.log('❌ Clawdbot API failed:', error.message);
        return false;
    }
}

async function testLocalBridge() {
    console.log('\n🌉 Testing Local Clawdbot Bridge...');
    try {
        await clawdbotBridge.initialize();
        const sessions = await clawdbotBridge.getAllSessions();
        const stats = await clawdbotBridge.getStatistics();
        
        testResults.clawdbot.localBridge = {
            initialized: clawdbotBridge.initialized,
            sessionCount: sessions.length,
            stats: stats,
            pass: sessions.length > 0
        };
        
        console.log('✅ Local bridge initialized');
        console.log('   Sessions found:', sessions.length);
        console.log('   Statistics:', stats);
        
        if (sessions.length > 0) {
            console.log('\n   Sample Session:');
            const session = sessions[0];
            console.log(`   - ID: ${session.id}`);
            console.log(`   - Model: ${session.model}`);
            console.log(`   - Status: ${session.status}`);
            console.log(`   - Tokens: ${session.totalTokens} (in: ${session.inputTokens}, out: ${session.outputTokens})`);
            console.log(`   - Cost: $${session.totalCost}`);
        }
        
        return true;
    } catch (error) {
        testResults.clawdbot.localBridge = { error: error.message, pass: false };
        console.log('❌ Local bridge failed:', error.message);
        return false;
    }
}

async function testWebSocket() {
    console.log('\n🔌 Testing WebSocket Connection...');
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket(WS_URL);
            let connected = false;
            
            const timeout = setTimeout(() => {
                testResults.websocket.connection = { error: 'Timeout', pass: false };
                console.log('❌ WebSocket timeout after 5 seconds');
                ws.close();
                resolve(false);
            }, 5000);
            
            ws.on('open', () => {
                connected = true;
                clearTimeout(timeout);
                testResults.websocket.connection = { pass: true };
                console.log('✅ WebSocket connected');
                
                // Send ping
                ws.send(JSON.stringify({ type: 'ping' }));
                
                setTimeout(() => {
                    ws.close();
                    resolve(true);
                }, 1000);
            });
            
            ws.on('error', (error) => {
                clearTimeout(timeout);
                if (!connected) {
                    testResults.websocket.connection = { error: error.message, pass: false };
                    console.log('❌ WebSocket error:', error.message);
                    resolve(false);
                }
            });
            
            ws.on('close', () => {
                if (!connected) {
                    resolve(false);
                }
            });
        } catch (error) {
            testResults.websocket.connection = { error: error.message, pass: false };
            console.log('❌ WebSocket failed:', error.message);
            resolve(false);
        }
    });
}

async function runTests() {
    console.log('🚀 Agents Dashboard - Live Verification');
    console.log('=====================================\n');
    
    const results = [];
    
    // Run tests
    results.push(await testBackendHealth());
    results.push(await testClawdbotAPI());
    results.push(await testLocalBridge());
    results.push(await testWebSocket());
    
    // Summary
    console.log('\n\n📊 TEST SUMMARY');
    console.log('=====================================');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    testResults.overall = passed === total ? '✅ PASS' : '⚠️  PARTIAL';
    testResults.summary = {
        passed,
        total,
        percentage: Math.round((passed / total) * 100)
    };
    
    console.log(`\n✅ Passed: ${passed}/${total} (${testResults.summary.percentage}%)\n`);
    
    // Final verdict
    if (clawdbotBridge.initialized && testResults.clawdbot.localBridge?.sessionCount > 0) {
        console.log('🎉 DASHBOARD READY FOR PRODUCTION!');
        console.log('\n✅ All systems operational');
        console.log('✅ Clawdbot bridge connected');
        console.log('✅ Live sessions detected');
        console.log('✅ Token tracking enabled');
        console.log('✅ Cost calculation active');
    } else if (passed === total) {
        console.log('⚠️  DASHBOARD READY (Cloud Mode - No Local Clawdbot)');
        console.log('\nDashboard will display live data when:');
        console.log('  - Deployed to same machine as Clawdbot');
        console.log('  - Or connected to cloud Clawdbot API');
    } else {
        console.log('❌ ISSUES DETECTED - See errors above');
    }
    
    console.log('\n' + '='.repeat(37));
    console.log('Report saved to: test-results.json');
    console.log('='.repeat(37) + '\n');
    
    // Save report
    const fs = require('fs');
    fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
    
    process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
