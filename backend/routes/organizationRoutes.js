const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

router.get('/organizations', organizationController.getOrganizations);
router.get('/organizations/:id', organizationController.getOrganizationById);

module.exports = router;
