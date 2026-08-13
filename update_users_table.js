require('dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/db');

async function run() {
    try {
        console.log('Adding organization_id to users table...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
        `);
        console.log('Success');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
