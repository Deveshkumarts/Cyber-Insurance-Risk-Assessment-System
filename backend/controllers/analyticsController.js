const db = require('../config/db');

// Map attack patterns to AI Recommendations
const aiRecommendationEngine = {
    'Phishing': 'Implement advanced email filtering and conduct weekly phishing simulation training.',
    'Malware': 'Deploy Next-Generation Antivirus (NGAV) and ensure endpoint detection and response (EDR) is active.',
    'Ransomware': 'Enforce immutable backups and segment the network to prevent lateral movement.',
    'Insider Threat': 'Implement Principle of Least Privilege (PoLP) and robust User Entity Behavior Analytics (UEBA).',
    'DDoS': 'Enable DDoS mitigation services and configure rate limiting on public-facing assets.',
    'SQL Injection': 'Audit application code for parameterized queries and deploy a Web Application Firewall (WAF).',
    'General': 'Conduct a comprehensive penetration test and update the incident response plan.'
};

exports.getPredictiveAnalytics = async (req, res) => {
    const { orgId } = req.params;

    if (!orgId) {
        return res.status(400).json({ error: 'Organization ID is required' });
    }

    try {
        // 1. Fetch latest assessment score (Baseline)
        const assRes = await db.query(
            'SELECT score FROM assessments WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
            [orgId]
        );
        let baselineScore = assRes.rows.length > 0 ? assRes.rows[0].score : 0; // default to 0 if none

        // 2. Fetch Assets for Loss Estimation
        const assetRes = await db.query(
            'SELECT asset_value FROM assets WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1',
            [orgId]
        );
        let totalAssetValue = assetRes.rows.length > 0 ? parseFloat(assetRes.rows[0].asset_value) : 0; // default 0

        // 3. Fetch Historical Incidents
        const incidentsRes = await db.query(
            'SELECT severity_score, attack_pattern, reported_at FROM incidents WHERE organization_id = $1 ORDER BY reported_at ASC',
            [orgId]
        );
        
        const incidents = incidentsRes.rows;
        let futureRiskScore = baselineScore;
        let attackFrequencies = {};
        
        const monthlyTrends = {
            'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
            'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
        };

        incidents.forEach(inc => {
            // Adjust risk score based on severity (1-10 scale assumed, or just abstract).
            const severity = inc.severity_score || 5; 
            futureRiskScore -= (severity * 1.5); // Penalty

            // Track attack patterns
            const pattern = inc.attack_pattern || 'General';
            attackFrequencies[pattern] = (attackFrequencies[pattern] || 0) + 1;

            // Track monthly trends
            const month = new Date(inc.reported_at).toLocaleString('default', { month: 'short' });
            if (monthlyTrends[month] !== undefined) {
                monthlyTrends[month]++;
            }
        });

        // Cap futureRiskScore between 0 and 100
        futureRiskScore = Math.max(0, Math.min(100, Math.round(futureRiskScore)));

        // 4. Calculate Predicted Loss Estimate
        const riskPercentage = (100 - futureRiskScore) / 100;
        const predictedLossEstimate = Math.round(totalAssetValue * 0.40 * riskPercentage);

        // 5. Attack Forecasting (Most frequent attack)
        let mostLikelyAttack = 'General';
        let maxFreq = 0;
        for (const [pattern, freq] of Object.entries(attackFrequencies)) {
            if (freq > maxFreq) {
                maxFreq = freq;
                mostLikelyAttack = pattern;
            }
        }

        // 6. AI Recommendations
        const recommendations = [
            aiRecommendationEngine[mostLikelyAttack] || aiRecommendationEngine['General']
        ];
        if (futureRiskScore < 50) {
            recommendations.push('Immediate executive review of cybersecurity posture is required due to high forecasted risk.');
        } else if (futureRiskScore < 80) {
            recommendations.push('Consider upgrading cyber insurance coverage to mitigate remaining financial exposure.');
        }

        res.status(200).json({
            futureRiskScore,
            predictedLossEstimate,
            mostLikelyAttack,
            attackFrequencies,
            threatTrends: monthlyTrends,
            recommendations
        });

    } catch (err) {
        console.error('Error fetching predictive analytics:', err);
        res.status(500).json({ error: 'Database error' });
    }
};
