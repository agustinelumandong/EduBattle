import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: "postgresql://postgres:edubattle123@db.cegblmctxnxqzlbmhpzl.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false, // Supabase requires SSL
  },
});

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ Connected to Supabase Postgres!");
    const res = await client.query("SELECT NOW()");
    console.log("Server time:", res.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.end();
  }
}

testConnection();
