#!/usr/bin/env node

/**
 * Simple API testing script
 * Usage: node scripts/test-api.js [port]
 */

const PORT = process.argv[2] || 3000;
const BASE_URL = `http://localhost:${PORT}/api`;

async function testEndpoint(method, endpoint, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`\n🧪 Testing ${method} ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success (${response.status})`);
      if (result.data) {
        if (Array.isArray(result.data)) {
          console.log(`   Found ${result.data.length} items`);
        } else {
          console.log(`   Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      }
    } else {
      console.log(`❌ Failed (${response.status})`);
      console.log(`   Error: ${result.message}`);
    }
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  const tests = [
    // Test basic endpoints
    { method: 'GET', endpoint: '/classifications', description: 'Get classifications' },
    { method: 'GET', endpoint: '/sources', description: 'Get sources' },
    { method: 'GET', endpoint: '/meals', description: 'Get meals' },
    { method: 'GET', endpoint: '/courses', description: 'Get courses' },
    { method: 'GET', endpoint: '/preparations', description: 'Get preparations' },
    { method: 'GET', endpoint: '/users', description: 'Get users' },
    { method: 'GET', endpoint: '/recipes', description: 'Get recipes' },
    { method: 'GET', endpoint: '/recipes/public', description: 'Get public recipes' },
    { method: 'GET', endpoint: '/cookbooks', description: 'Get cookbooks' },
    { method: 'GET', endpoint: '/cookbooks/public', description: 'Get public cookbooks' },
    
    // Test search
    { method: 'GET', endpoint: '/recipes/search?q=test', description: 'Search recipes' },
    
    // Test admin endpoints
    { method: 'GET', endpoint: '/admin/stats', description: 'Get admin stats' },
  ];

  for (const test of tests) {
    const result = await testEndpoint(test.method, test.endpoint, test.data);
    results.tests.push({ ...test, ...result });
    
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);

  if (results.failed > 0) {
    console.log('\n💡 Failed Tests:');
    results.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`   - ${test.method} ${test.endpoint}: ${test.error || 'Unknown error'}`);
      });
  }

  console.log('\n✨ API testing completed!');
  console.log('\n💡 Next Steps:');
  console.log('   1. Start your development server: npm run dev');
  console.log('   2. Set up your database: npm run db:migrate');
  console.log('   3. Generate Prisma client: npm run db:generate');
  console.log('   4. Seed your database: npm run db:seed');
  console.log('   5. Run this test again: node scripts/test-api.js');
}

// Check if the server is likely running
async function checkServer() {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/classifications`);
    return response.status !== undefined;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('⚠️  Server not detected. Make sure your Next.js app is running on port', PORT);
    console.log('   Start server with: npm run dev');
    process.exit(1);
  }
  
  await runTests();
}

main().catch(console.error);