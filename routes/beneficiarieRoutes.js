const express = require('express');
const router = express.Router();
const beneficiarieController = require('../controllers/beneficiarieController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createBeneficiarySchema, updateBeneficiarySchema } = require('./validationSchemas');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

router.get('/', encryptResponse, beneficiarieController.index);
router.post('/',decryptRequest, encryptResponse, validateRequest(createBeneficiarySchema), beneficiarieController.store);
router.get('/:id', encryptResponse, beneficiarieController.show);
router.put('/:id', decryptRequest, encryptResponse, validateRequest(updateBeneficiarySchema), beneficiarieController.update);
router.delete('/:id', encryptResponse, beneficiarieController.destroy);

module.exports = router;
