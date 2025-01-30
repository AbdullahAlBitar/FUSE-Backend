const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { signInSchema, signUpSchema, signUpSchemaEmployee } = require('./validationSchemas');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authRole');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

router.post('/login', decryptRequest, encryptResponse, validateRequest(signInSchema), authController.login);
router.post('/register', decryptRSA, validateRequest(signUpSchema), authController.register);

router.post('/dashboard/login', decryptRequest, encryptResponse, validateRequest(signInSchema), authController.loginDashboard);
router.post('/register/employee', authenticateJWT, isAdmin, decryptRequest, encryptResponse, validateRequest(signUpSchemaEmployee), authController.registerEmployee);

router.get('/logout', authController.logout);

module.exports = router;
