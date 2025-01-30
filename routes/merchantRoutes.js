const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { updateMerchantSchema, generateMerchantBill } = require('./validationSchemas');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

router.get('/', encryptResponse, merchantController.index);
router.get('/:id', encryptResponse, merchantController.show);
router.post('/generate/bill', decryptRequest, encryptResponse, validateRequest(generateMerchantBill), merchantController.genBill);
router.put('/:id', decryptRequest, encryptResponse, validateRequest(updateMerchantSchema), merchantController.update);
router.delete('/:id', encryptResponse, merchantController.destroy);

module.exports = router;