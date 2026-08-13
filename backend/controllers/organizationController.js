const db = require('../config/db');

exports.getOrganizations = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT o.id, o.organization_name, o.industry, o.employees, 
                   (SELECT risk_category FROM assessments a WHERE a.organization_id = o.id ORDER BY created_at DESC LIMIT 1) as risk_category
            FROM organizations o
            ORDER BY o.organization_name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching organizations' });
    }
};

exports.getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT o.id, o.organization_name, o.industry, o.employees,
                   (SELECT risk_category FROM assessments a WHERE a.organization_id = o.id ORDER BY created_at DESC LIMIT 1) as risk_category
            FROM organizations o 
            WHERE o.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while fetching organization details' });
    }
};
