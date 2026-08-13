const { Pool } = require('pg');

// If using Supabase, you can set the DATABASE_URL in the .env file.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If required by Supabase/production, enable ssl
  // ssl: { rejectUnauthorized: false }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
