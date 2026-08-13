const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

// Incident routes
router.post('/incidents', incidentController.reportIncident);
router.get('/incidents', incidentController.getIncidents);
router.get('/incidents/:id', incidentController.getIncidentById);
router.post('/incidents/:id/updates', incidentController.addIncidentUpdate);

// Incident log routes
router.post('/incidents/:id/logs', incidentController.addIncidentLog);

// Investigation workflow routes
router.put('/incidents/:id/investigation', incidentController.updateInvestigation);

module.exports = router;
