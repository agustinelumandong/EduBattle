// 🌍 World App Debug Script
// Open World App Developer Tools (if available) and paste this in the console

console.log("🌍 Starting World App debug test...");

// Test 1: Check environment
console.log("📱 User Agent:", navigator.userAgent);
console.log("🔍 Location:", window.location.href);
console.log("🌐 Origin:", window.location.origin);

// Test 2: Test health check
async function testHealthCheck() {
  try {
    console.log("🏥 Testing health check...");
    const response = await fetch('/api/debug/health');
    const result = await response.json();
    console.log("✅ Health check result:", result);
    return result;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return null;
  }
}

// Test 3: Test World App specific endpoint
async function testWorldAppEndpoint() {
  try {
    console.log("🌍 Testing World App endpoint...");
    const response = await fetch('/api/debug/world-app-test');
    const result = await response.json();
    console.log("✅ World App test result:", result);
    return result;
  } catch (error) {
    console.error("❌ World App test failed:", error);
    return null;
  }
}

// Test 4: Manual wallet registration
async function testManualWalletRegistration() {
  try {
    console.log("🧪 Testing manual wallet registration...");
    const testData = {
      address: "0x1234567890123456789012345678901234567890",
      username: `WorldAppUser_${Date.now()}`
    };
    
    console.log("📝 Test data:", testData);
    
    const response = await fetch('/api/debug/world-app-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    console.log("✅ Manual registration result:", result);
    return result;
  } catch (error) {
    console.error("❌ Manual registration failed:", error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Running all debug tests...");
  
  const healthResult = await testHealthCheck();
  const worldAppResult = await testWorldAppEndpoint();
  const manualRegResult = await testManualWalletRegistration();
  
  console.log("📊 Test Summary:", {
    health: healthResult?.success ? "✅" : "❌",
    worldApp: worldAppResult?.success ? "✅" : "❌", 
    manualRegistration: manualRegResult?.success ? "✅" : "❌"
  });
  
  if (healthResult?.diagnostics?.database?.includes("Failed")) {
    console.error("🚨 DATABASE ISSUE DETECTED!");
    console.error("Check your Vercel environment variables:");
    console.error("- DATABASE_URL");
    console.error("- DIRECT_URL");
    console.error("- JWT_SECRET");
  }
  
  return {
    health: healthResult,
    worldApp: worldAppResult,
    manualRegistration: manualRegResult
  };
}

// Auto-run tests
runAllTests().then(results => {
  console.log("🎯 All tests completed!");
  window.debugResults = results; // Store for inspection
});

console.log("💡 Debug script loaded. Results will be stored in window.debugResults");
console.log("💡 You can also run individual tests:");
console.log("   - testHealthCheck()");
console.log("   - testWorldAppEndpoint()"); 
console.log("   - testManualWalletRegistration()");
console.log("   - runAllTests()");
