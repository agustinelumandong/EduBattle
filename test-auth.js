// Simple test script to debug authentication issues
// Run this locally with: node test-auth.js

const BASE_URL = process.argv[2] || 'http://localhost:3000';

console.log(`🧪 Testing authentication on: ${BASE_URL}`);

async function testAuth() {
  try {
    // Test health check first
    console.log('\n1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/debug/health`);
    const healthData = await healthResponse.json();
    console.log('Health check result:', JSON.stringify(healthData, null, 2));

    if (!healthData.success) {
      console.log('❌ Health check failed - stopping tests');
      return;
    }

    // Test registration
    console.log('\n2️⃣ Testing registration...');
    const testUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      username: 'testuser'
    };

    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();
    console.log('Registration result:', JSON.stringify(registerData, null, 2));

    if (registerData.success) {
      console.log('✅ Registration successful');
      
      // Test login with the same user
      console.log('\n3️⃣ Testing login...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      });

      const loginData = await loginResponse.json();
      console.log('Login result:', JSON.stringify(loginData, null, 2));

      if (loginData.success) {
        console.log('✅ Login successful');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testAuth();
