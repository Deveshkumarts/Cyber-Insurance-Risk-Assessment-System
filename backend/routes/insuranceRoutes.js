const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');

// Module 2 Routes
router.post('/assets', insuranceController.calculateAndSavePremium); // Also acts as calculate-premium
router.post('/simulate-premium', insuranceController.simulatePremium);
router.get('/insurance-dashboard/:orgId', insuranceController.getDashboardData);
router.get('/insurance-quotes/organization/:orgId', insuranceController.getQuotesByOrg);

module.exports = router;
