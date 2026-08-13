require('dotenv').config();
const db = require('./config/db');

async function apply() {
    try {
        console.log("Applying schema alterations...");
        // Add organization_id if it doesn't exist
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
            ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Employee';
        `);

        // Update incidents table
        await db.query(`
            ALTER TABLE incidents
            ADD COLUMN IF NOT EXISTS reported_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
            ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL;
        `);

        // Create incident_updates table
        await db.query(`
            CREATE TABLE IF NOT EXISTS incident_updates (
                id SERIAL PRIMARY KEY,
                incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                message TEXT NOT NULL,
                status_change VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Schema updated successfully.");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
apply();
