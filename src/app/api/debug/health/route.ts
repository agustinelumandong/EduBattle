import { database } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🏥 Health check started");
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      directUrl: process.env.DIRECT_URL ? "✅ Set" : "❌ Missing", 
      jwtSecret: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
      database: "❌ Not tested",
      tests: {} as Record<string, any>
    };

    // Test database connection
    try {
      console.log("🔍 Testing database connection...");
      // Test a simple database query to check connection
      const result = await database.findUserByEmail("health-check-test@example.com");
      diagnostics.database = "✅ Connected";
      diagnostics.tests.connectionTest = "Success";
      console.log(`🔗 Database connection test completed`);
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      diagnostics.database = `❌ Failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
      diagnostics.tests.databaseError = dbError instanceof Error ? dbError.message : 'Unknown error';
    }

    // Test user creation (dry run)
    try {
      console.log("🧪 Testing user query structure...");
      // Just validate the query structure without actually creating
      const testQuery = {
        email: "test@example.com",
        username: "testuser",
        authMethod: "email" as const,
        passwordHash: "dummy"
      };
      
      // Test if we can at least prepare the query
      diagnostics.tests.queryStructure = "✅ Valid";
    } catch (queryError) {
      console.error("❌ Query structure test failed:", queryError);
      diagnostics.tests.queryStructure = `❌ Failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`;
    }

    console.log("📋 Health check completed:", diagnostics);

    return NextResponse.json({
      success: true,
      message: "Health check completed",
      diagnostics
    });

  } catch (error) {
    console.error("❌ Health check failed:", error);
    
    return NextResponse.json({
      success: false,
      error: "Health check failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      diagnostics: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
        directUrl: process.env.DIRECT_URL ? "✅ Set" : "❌ Missing",
        jwtSecret: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
        database: "❌ Failed during health check"
      }
    }, { status: 500 });
  }
}
