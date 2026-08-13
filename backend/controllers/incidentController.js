const db = require('../config/db');

exports.reportIncident = async (req, res) => {
    try {
        const { organization_id, title, description, user_id } = req.body;
        const query = `
            INSERT INTO incidents (organization_id, title, description, status, reported_by)
            VALUES ($1, $2, $3, 'Reported', $4)
            RETURNING *;
        `;
        const values = [organization_id, title, description, user_id || null];
        const result = await db.query(query, values);
        
        // Create an initial investigation record
        const invQuery = `
            INSERT INTO investigations (incident_id, status)
            VALUES ($1, 'Open')
            RETURNING *;
        `;
        await db.query(invQuery, [result.rows[0].id]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while reporting incident' });
    }
};

exports.getIncidents = async (req, res) => {
    try {
        const { organization_id, user_id, role } = req.query;
        let query = 'SELECT * FROM incidents ORDER BY reported_at DESC';
        let values = [];
        
        if (organization_id) {
            if (role === 'Employee' && user_id) {
                query = 'SELECT * FROM incidents WHERE organization_id = $1 AND reported_by = $2 ORDER BY reported_at DESC';
                values = [organization_id, user_id];
            } else {
                query = 'SELECT * FROM incidents WHERE organization_id = $1 ORDER BY reported_at DESC';
                values = [organization_id];
            }
        }
        
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching incidents' });
    }
};

exports.getIncidentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Fetch Incident
        const incResult = await db.query('SELECT * FROM incidents WHERE id = $1', [id]);
        if (incResult.rows.length === 0) return res.status(404).json({ error: 'Incident not found' });
        
        // Fetch Logs
        const logResult = await db.query('SELECT * FROM incident_logs WHERE incident_id = $1 ORDER BY created_at ASC', [id]);
        
        // Fetch Investigation
        const invResult = await db.query('SELECT * FROM investigations WHERE incident_id = $1', [id]);
        
        // Fetch Updates
        const updatesResult = await db.query(`
            SELECT u.*, us.email, us.role 
            FROM incident_updates u 
            LEFT JOIN users us ON u.user_id = us.id 
            WHERE u.incident_id = $1 
            ORDER BY u.created_at ASC
        `, [id]);
        
        res.json({
            incident: incResult.rows[0],
            logs: logResult.rows,
            investigation: invResult.rows[0] || null,
            updates: updatesResult.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching incident details' });
    }
};

exports.addIncidentLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { log_source, log_data } = req.body;
        
        const query = `
            INSERT INTO incident_logs (incident_id, log_source, log_data)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [id, log_source, log_data]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding incident log' });
    }
};

exports.updateInvestigation = async (req, res) => {
    try {
        const { id } = req.params; // incident id
        const { threat_identified, impact_assessment, investigation_report, status, attack_pattern, severity_score, incident_status } = req.body;
        
        const invQuery = `
            UPDATE investigations 
            SET threat_identified = $1, impact_assessment = $2, investigation_report = $3, status = $4, updated_at = CURRENT_TIMESTAMP
            WHERE incident_id = $5
            RETURNING *;
        `;
        const invValues = [threat_identified, impact_assessment, investigation_report, status, id];
        const invResult = await db.query(invQuery, invValues);
        
        const incQuery = `
            UPDATE incidents
            SET attack_pattern = COALESCE($1, attack_pattern),
                severity_score = COALESCE($2, severity_score),
                status = COALESCE($3, status)
            WHERE id = $4
            RETURNING *;
        `;
        const parsedSeverity = severity_score === '' ? null : severity_score;
        const incValues = [attack_pattern || null, parsedSeverity, incident_status, id];
        await db.query(incQuery, incValues);
        
        res.json({ message: 'Investigation updated successfully', investigation: invResult.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating investigation' });
    }
};

exports.addIncidentUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id, message, status_change } = req.body;
        
        const query = `
            INSERT INTO incident_updates (incident_id, user_id, message, status_change)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await db.query(query, [id, user_id, message, status_change]);
        
        // Fetch back with user details
        const updateResult = await db.query(`
            SELECT u.*, us.email, us.role 
            FROM incident_updates u 
            LEFT JOIN users us ON u.user_id = us.id 
            WHERE u.id = $1
        `, [result.rows[0].id]);

        if (status_change) {
            await db.query(`UPDATE incidents SET status = $1 WHERE id = $2`, [status_change, id]);
        }

        res.status(201).json(updateResult.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding incident update' });
    }
};
