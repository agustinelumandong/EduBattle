import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🌍 World App Mini App test started");
    
    // Test if we're in World App environment
    const userAgent = request.headers.get('user-agent') || '';
    const isWorldApp = userAgent.includes('WorldApp') || userAgent.includes('World App');
    
    console.log("📱 User Agent:", userAgent);
    console.log("🌍 Is World App:", isWorldApp);
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      userAgent: userAgent,
      isWorldApp: isWorldApp,
      databaseUrl: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      directUrl: process.env.DIRECT_URL ? "✅ Set" : "❌ Missing",
      jwtSecret: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
      database: "❌ Not tested",
      tests: {} as Record<string, any>
    };

    // Test database connection
    try {
      console.log("🔍 Testing database connection...");
      await database.findUserByEmail("test@worldapp.test");
      diagnostics.database = "✅ Connected";
      diagnostics.tests.databaseConnection = "Success";
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      diagnostics.database = `❌ Failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
      diagnostics.tests.databaseError = dbError instanceof Error ? dbError.message : 'Unknown error';
    }

    // Test wallet user creation
    try {
      console.log("🧪 Testing wallet user creation...");
      const testAddress = `0x${Date.now().toString(16).padStart(40, '0')}`;
      const testUser = await database.createUser({
        walletAddress: testAddress,
        username: `WorldAppTest_${Date.now()}`,
        authMethod: "wallet",
      });
      
      diagnostics.tests.walletUserCreation = "Success";
      diagnostics.tests.createdUserId = testUser.id;
      console.log("✅ Test wallet user created:", testUser.id);
    } catch (createError) {
      console.error("❌ Wallet user creation failed:", createError);
      diagnostics.tests.walletUserCreation = `Failed: ${createError instanceof Error ? createError.message : 'Unknown error'}`;
    }

    return NextResponse.json({
      success: true,
      message: "World App Mini App test completed",
      diagnostics
    });

  } catch (error) {
    console.error("❌ World App test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "World App test failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🧪 Manual wallet registration test via World App");
    
    const body = await request.json();
    const { address, username } = body;
    
    console.log("📝 Test registration data:", { 
      address: address?.slice(0, 10) + "...", 
      username,
      timestamp: new Date().toISOString()
    });

    // Simulate the exact same call as the real wallet auth
    const response = await fetch(`${request.nextUrl.origin}/api/auth/wallet-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, username }),
    });

    const result = await response.json();
    
    console.log("📊 Registration result:", result);

    return NextResponse.json({
      success: true,
      message: "Manual wallet registration test completed",
      registrationResult: result,
      registrationStatus: response.status,
      registrationOk: response.ok
    });

  } catch (error) {
    console.error("❌ Manual wallet registration test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Manual test failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
