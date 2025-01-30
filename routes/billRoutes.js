const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createBillSchema, payBillSchema } = require('./validationSchemas');
const { isMerchant } = require('../middleware/authRole');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

router.put('/', isMerchant, decryptRequest, encryptResponse, validateRequest(createBillSchema), billController.store);
router.post('/unpaid', isMerchant, encryptResponse, billController.showUnpaid);
router.post('/:id', decryptRequest, encryptResponse, billController.show);
router.post('/pay/:id', decryptRequest, encryptResponse, validateRequest(payBillSchema), billController.pay);

module.exports = router;
