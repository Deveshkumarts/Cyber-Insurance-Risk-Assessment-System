const db = require('../config/db');

const BASE_PREMIUM_RATE = 0.01; // 1%

// Calculate Risk Score and Premium logic
const evaluateRisk = (mod1Score, threatProb, vulnScore) => {
    // Mod 1 Score is 0-100 (higher is better security in Mod 1, wait, let's check Mod 1)
    // In Mod 1: score >= 80 is Low Risk. So higher score = lower risk.
    
    // We want a unified risk score. Let's say max risk is 100.
    // Invert mod1Score: 100 - mod1Score.
    let baseRisk = 100 - mod1Score;
    
    // Threat Probability: Low(10), Medium(20), High(30), Critical(40)
    let threatValue = 0;
    if (threatProb === 'Low') threatValue = 10;
    if (threatProb === 'Medium') threatValue = 20;
    if (threatProb === 'High') threatValue = 30;
    if (threatProb === 'Critical') threatValue = 40;

    // final score out of ~100.
    let finalRiskScore = Math.min(100, Math.max(0, baseRisk + threatValue + vulnScore));
    
    let category = 'Low Risk';
    let multiplier = 1.0;
    let tier = 'Basic Coverage';

    if (finalRiskScore > 75) {
        category = 'Critical Risk';
        multiplier = 2.0;
        tier = 'Enterprise Coverage';
    } else if (finalRiskScore > 50) {
        category = 'High Risk';
        multiplier = 1.6;
        tier = 'Premium Coverage';
    } else if (finalRiskScore > 25) {
        category = 'Medium Risk';
        multiplier = 1.3;
        tier = 'Standard Coverage';
    }

    return { finalRiskScore, category, multiplier, tier };
};

exports.calculateAndSavePremium = async (req, res) => {
    try {
        const { organization_id, asset_value, security_controls, historical_incidents, patch_management_status, backup_availability, threat_probability } = req.body;
        
        // Fetch organization details to get industry and employees
        const orgRes = await db.query('SELECT industry, employees FROM organizations WHERE id = $1', [organization_id]);
        if (orgRes.rows.length === 0) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        const { industry: industry_type, employees } = orgRes.rows[0];

        // Knockout Rules
        let is_insurable = true;
        if (!backup_availability || patch_management_status === 'None') {
            is_insurable = false;
        }

        // Calculate Vulnerability Score
        let vulnScore = 0;
        vulnScore += historical_incidents * 5; // +5 risk per incident
        if (!backup_availability) vulnScore += 20;
        if (patch_management_status === 'None') vulnScore += 20;
        if (patch_management_status === 'Irregular') vulnScore += 10;
        
        // Fetch Mod 1 Score
        const mod1Res = await db.query(
            'SELECT score FROM assessments WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
            [organization_id]
        );
        
        let mod1Score = 50; // default if not found
        if (mod1Res.rows.length > 0) {
            mod1Score = mod1Res.rows[0].score;
        }

        const { finalRiskScore, category, multiplier, tier } = evaluateRisk(mod1Score, threat_probability, vulnScore);
        
        const premium = is_insurable ? (asset_value * BASE_PREMIUM_RATE * multiplier) : 0;

        // Save Asset
        await db.query(
            `INSERT INTO assets (organization_id, asset_value, employees, industry_type, security_controls, historical_incidents, patch_management_status, backup_availability) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [organization_id, asset_value, employees, industry_type, JSON.stringify(security_controls), historical_incidents, patch_management_status, backup_availability]
        );

        // Save Quote
        const quoteRes = await db.query(
            `INSERT INTO insurance_quotes (organization_id, risk_score, risk_category, premium, is_insurable, recommended_tier) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [organization_id, finalRiskScore, category, premium, is_insurable, tier]
        );

        res.status(201).json(quoteRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.simulatePremium = async (req, res) => {
    // For What-If Simulator
    try {
        const { organization_id, asset_value, security_controls, historical_incidents, patch_management_status, backup_availability, threat_probability } = req.body;
        
        let is_insurable = true;
        if (!backup_availability || patch_management_status === 'None') {
            is_insurable = false;
        }

        let vulnScore = 0;
        vulnScore += historical_incidents * 5;
        if (!backup_availability) vulnScore += 20;
        if (patch_management_status === 'None') vulnScore += 20;
        if (patch_management_status === 'Irregular') vulnScore += 10;
        
        const mod1Res = await db.query(
            'SELECT score FROM assessments WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
            [organization_id]
        );
        let mod1Score = 50;
        if (mod1Res.rows.length > 0) {
            mod1Score = mod1Res.rows[0].score;
        }

        const { finalRiskScore, category, multiplier, tier } = evaluateRisk(mod1Score, threat_probability, vulnScore);
        const premium = is_insurable ? (asset_value * BASE_PREMIUM_RATE * multiplier) : 0;

        res.json({ risk_score: finalRiskScore, category, premium, is_insurable, recommended_tier: tier });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const { orgId } = req.params;
        const quoteRes = await db.query(
            'SELECT * FROM insurance_quotes WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
            [orgId]
        );
        const assetRes = await db.query(
            'SELECT * FROM assets WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
            [orgId]
        );
        
        if (quoteRes.rows.length === 0 || assetRes.rows.length === 0) {
            return res.status(404).json({ error: 'Data not found' });
        }

        // Mock Industry Averages for Benchmarking
        const industryAverages = {
            risk_score: 55,
            premium: 15000
        };

        res.json({
            quote: quoteRes.rows[0],
            asset: assetRes.rows[0],
            industryAverages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getQuotesByOrg = async (req, res) => {
    const { orgId } = req.params;
    try {
        const quoteRes = await db.query(
            'SELECT * FROM insurance_quotes WHERE organization_id = $1 ORDER BY created_at DESC',
            [orgId]
        );
        res.json(quoteRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
