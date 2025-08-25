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
     
    const res = await client.query("SELECT NOW()");
     
  } catch (err) {
     
  } finally {
    await client.end();
  }
}

testConnection();
