const db = require('../config/db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Submit a new claim
const submitClaim = async (req, res) => {
    try {
        const { organization_id, incident_id } = req.body;
        
        const newClaim = await db.query(
            'INSERT INTO claims (organization_id, incident_id) VALUES ($1, $2) RETURNING *',
            [organization_id, incident_id]
        );
        
        await db.query(
            'INSERT INTO audit_trails (claim_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
            [newClaim.rows[0].id, 'Claim Submitted', 'Organization Admin', `Claim initiated for incident ${incident_id}`]
        );

        res.status(201).json(newClaim.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 2. Upload evidence for a claim
const uploadEvidence = async (req, res) => {
    try {
        const { claim_id, document_type, uploaded_by } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        // Calculate SHA-256 Hash for integrity
        const fileBuffer = fs.readFileSync(file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const integrityHash = hashSum.digest('hex');

        // Insert into database
        const newEvidence = await db.query(
            'INSERT INTO evidence (claim_id, file_name, file_path, document_type, integrity_hash, uploaded_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [claim_id, file.filename, file.path, document_type, integrityHash, uploaded_by || 'Unknown']
        );

        await db.query(
            'INSERT INTO audit_trails (claim_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
            [claim_id, 'Evidence Uploaded', uploaded_by || 'System', `Uploaded ${document_type}: ${file.originalname}`]
        );

        res.status(201).json(newEvidence.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 3. Verify specific evidence
const verifyEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        const { claim_id, is_verified, performed_by } = req.body;

        const updatedEvidence = await db.query(
            'UPDATE evidence SET is_verified = $1 WHERE id = $2 RETURNING *',
            [is_verified, id]
        );

        await db.query(
            'INSERT INTO audit_trails (claim_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
            [claim_id, is_verified ? 'Evidence Verified' : 'Evidence Rejected', performed_by || 'Adjuster', `Evidence ID ${id} was marked as ${is_verified ? 'verified' : 'rejected'}`]
        );

        res.json(updatedEvidence.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 4. Evaluate Claim (update authenticity score and status)
const evaluateClaim = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, performed_by } = req.body;

        // Calculate authenticity score based on percentage of verified evidence
        const evidenceCheck = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_verified THEN 1 ELSE 0 END) as verified FROM evidence WHERE claim_id = $1', [id]);
        
        let authenticity_score = 0;
        const total = parseInt(evidenceCheck.rows[0].total);
        const verified = parseInt(evidenceCheck.rows[0].verified) || 0;

        if (total > 0) {
            authenticity_score = Math.round((verified / total) * 100);
        }

        const updatedClaim = await db.query(
            'UPDATE claims SET status = $1, authenticity_score = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [status, authenticity_score, id]
        );

        await db.query(
            'INSERT INTO audit_trails (claim_id, action, performed_by, details) VALUES ($1, $2, $3, $4)',
            [id, 'Claim Evaluated', performed_by || 'Adjuster', `Status changed to ${status}. Score: ${authenticity_score}`]
        );

        res.json(updatedClaim.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 5. Get all claims
const getClaims = async (req, res) => {
    try {
        const claims = await db.query(`
            SELECT c.*, o.organization_name, i.title as incident_title 
            FROM claims c 
            JOIN organizations o ON c.organization_id = o.id 
            JOIN incidents i ON c.incident_id = i.id
            ORDER BY c.created_at DESC
        `);
        res.json(claims.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// 6. Get claim details (with evidence and audit trails)
const getClaimDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const claimInfo = await db.query(`
            SELECT c.*, o.organization_name, i.title as incident_title, i.description as incident_desc
            FROM claims c 
            JOIN organizations o ON c.organization_id = o.id 
            JOIN incidents i ON c.incident_id = i.id
            WHERE c.id = $1
        `, [id]);

        if (claimInfo.rows.length === 0) {
            return res.status(404).json({ msg: 'Claim not found' });
        }

        const evidenceInfo = await db.query('SELECT * FROM evidence WHERE claim_id = $1 ORDER BY created_at DESC', [id]);
        const auditInfo = await db.query('SELECT * FROM audit_trails WHERE claim_id = $1 ORDER BY created_at DESC', [id]);

        res.json({
            claim: claimInfo.rows[0],
            evidence: evidenceInfo.rows,
            audit_trails: auditInfo.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    submitClaim,
    uploadEvidence,
    verifyEvidence,
    evaluateClaim,
    getClaims,
    getClaimDetails
};
