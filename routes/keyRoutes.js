const express = require('express');
const router = express.Router();
const keyController = require("../controllers/keyController")
const { validateRequest } = require('../middleware/validationMiddleware');
const { setAESKeySchema } = require('./validationSchemas');

router.get('/getPublic', keyController.publicKey)
router.post('/setAESKey', validateRequest(setAESKeySchema), keyController.setAESKey);

module.exports = router;
