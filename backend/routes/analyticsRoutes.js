const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/:orgId', analyticsController.getPredictiveAnalytics);

module.exports = router;
