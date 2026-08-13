const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    submitClaim,
    uploadEvidence,
    verifyEvidence,
    evaluateClaim,
    getClaims,
    getClaimDetails
} = require('../controllers/claimController');

// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Uploads directory in backend
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
router.post('/claims', submitClaim);
router.post('/claims/evidence', upload.single('evidenceFile'), uploadEvidence);
router.put('/claims/evidence/:id/verify', verifyEvidence);
router.put('/claims/:id/evaluate', evaluateClaim);
router.get('/claims', getClaims);
router.get('/claims/:id', getClaimDetails);

module.exports = router;
