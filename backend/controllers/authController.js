const db = require('../config/db');
const bcrypt = require('bcryptjs');


exports.register = async (req, res) => {
    const { organization_name, industry, employees, email, password, role } = req.body;
    
    try {
        // Check if email already exists
        const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Transaction
        await db.query('BEGIN');

        // Check if Organization Exists
        let orgId;
        let finalIndustry = industry;
        let finalEmployees = employees;
        const orgCheck = await db.query('SELECT * FROM organizations WHERE organization_name = $1', [organization_name]);
        
        if (orgCheck.rows.length > 0) {
            orgId = orgCheck.rows[0].id;
            finalIndustry = orgCheck.rows[0].industry;
            finalEmployees = orgCheck.rows[0].employees;
        } else {
            // Create Organization
            const orgRes = await db.query(
                'INSERT INTO organizations (organization_name, industry, employees) VALUES ($1, $2, $3) RETURNING id',
                [organization_name, industry, employees]
            );
            orgId = orgRes.rows[0].id;
        }


        // Create User
        await db.query(
            'INSERT INTO users (email, password_hash, organization_id, role) VALUES ($1, $2, $3, $4)',
            [email, passwordHash, orgId, role || 'Employee']
        );

        await db.query('COMMIT');

        res.status(201).json({
            orgId,
            user: { email, role: role || 'Employee' },
            organization: {
                id: orgId,
                organization_name,
                industry: finalIndustry,
                employees: finalEmployees
            }
        });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = userRes.rows[0];
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Fetch user's organization data
        const orgRes = await db.query(`
            SELECT o.id, o.organization_name, o.industry, o.employees,
                   (SELECT risk_category FROM assessments a WHERE a.organization_id = o.id ORDER BY created_at DESC LIMIT 1) as risk_category
            FROM organizations o
            WHERE o.id = $1
        `, [user.organization_id]);

        const organization = orgRes.rows[0];

        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, role: user.role },
            organization
        });
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
