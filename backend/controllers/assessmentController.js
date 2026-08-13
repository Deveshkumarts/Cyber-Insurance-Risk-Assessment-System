const db = require('../config/db');

const weights = {
    mfa: 15,
    antivirus: 10,
    firewall: 10,
    security_updates: 15,
    training: 10,
    backups: 15,
    encryption: 10,
    incident_response: 15
};

const calculateScore = (answers) => {
    let score = 0;
    if (answers.mfa) score += weights.mfa;
    if (answers.antivirus) score += weights.antivirus;
    if (answers.firewall) score += weights.firewall;
    if (answers.security_updates) score += weights.security_updates;
    if (answers.training) score += weights.training;
    if (answers.backups) score += weights.backups;
    if (answers.encryption) score += weights.encryption;
    if (answers.incident_response) score += weights.incident_response;
    return score;
};

const getCategory = (score) => {
    if (score >= 80) return 'Low Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
};

const generateRecommendations = (answers) => {
    const recommendations = [];
    if (!answers.mfa) recommendations.push('Enable Multi-Factor Authentication (MFA) to add an extra layer of security.');
    if (!answers.antivirus) recommendations.push('Install and update Antivirus software across all devices.');
    if (!answers.firewall) recommendations.push('Enable network firewalls to block unauthorized access.');
    if (!answers.security_updates) recommendations.push('Implement a policy for regular security updates and patch management.');
    if (!answers.training) recommendations.push('Conduct regular cybersecurity awareness training for all employees.');
    if (!answers.backups) recommendations.push('Establish a secure, off-site data backup strategy.');
    if (!answers.encryption) recommendations.push('Implement data encryption for sensitive data at rest and in transit.');
    if (!answers.incident_response) recommendations.push('Develop and test an Incident Response Plan.');
    return recommendations;
};

exports.submitAssessment = async (req, res) => {
    const { orgId, answers } = req.body;
    
    // answers expected object: { mfa: boolean, antivirus: boolean, ... }

    if (!orgId) {
        return res.status(400).json({ error: 'Organization ID is required' });
    }

    try {
        const score = calculateScore(answers);
        const category = getCategory(score);

        // Transaction

        const assRes = await db.query(
            'INSERT INTO assessments (organization_id, score, risk_category) VALUES ($1, $2, $3) RETURNING id',
            [orgId, score, category]
        );
        const assessmentId = assRes.rows[0].id;

        // Insert responses
        const questions = Object.keys(answers);
        for (let q of questions) {
            await db.query(
                'INSERT INTO responses (assessment_id, question, answer) VALUES ($1, $2, $3)',
                [assessmentId, q, answers[q]]
            );
        }

        res.status(201).json({
            assessmentId,
            orgId,
            score,
            category
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getAssessment = async (req, res) => {
    const { id } = req.params;
    try {
        const assRes = await db.query(
            `SELECT a.id, a.score, a.risk_category, a.organization_id as org_id, o.organization_name, o.industry, o.employees 
             FROM assessments a 
             JOIN organizations o ON a.organization_id = o.id 
             WHERE a.id = $1`,
            [id]
        );
        
        if (assRes.rows.length === 0) {
            return res.status(404).json({ error: 'Assessment not found' });
        }
        
        res.json(assRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getRecommendations = async (req, res) => {
    const { assessmentId } = req.params;
    try {
        const respRes = await db.query(
            'SELECT question, answer FROM responses WHERE assessment_id = $1',
            [assessmentId]
        );

        if (respRes.rows.length === 0) {
            return res.status(404).json({ error: 'Responses not found' });
        }

        const answers = {};
        respRes.rows.forEach(r => {
            answers[r.question] = r.answer;
        });

        const recommendations = generateRecommendations(answers);
        res.json({ recommendations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getAssessmentsByOrg = async (req, res) => {
    const { orgId } = req.params;
    try {
        const assRes = await db.query(
            'SELECT * FROM assessments WHERE organization_id = $1 ORDER BY created_at DESC',
            [orgId]
        );
        res.json(assRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};
