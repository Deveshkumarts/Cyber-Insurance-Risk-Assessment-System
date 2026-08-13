const express = require('express');
const router = express.Router();
const knowledgeBase = require('../data/knowledgeBase');
const assessmentController = require('../controllers/assessmentController');
const authenticateToken = require('../middleware/authMiddleware');

// Knowledge Base Route
router.get('/knowledge-base', (req, res) => {
    res.json(knowledgeBase);
});

// Assessment Routes
router.post('/assessment', assessmentController.submitAssessment);
router.get('/assessment/organization/:orgId', assessmentController.getAssessmentsByOrg);
router.get('/assessment/:id', assessmentController.getAssessment);
router.get('/recommendations/:assessmentId', assessmentController.getRecommendations);

module.exports = router;
