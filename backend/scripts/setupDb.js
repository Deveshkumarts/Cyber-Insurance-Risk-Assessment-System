require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDb() {
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying database schema...');
    await pool.query(schemaSql);
    console.log('Database schema applied successfully!');
  } catch (err) {
    console.error('Error applying database schema:', err);
  } finally {
    await pool.end();
  }
}

setupDb();
