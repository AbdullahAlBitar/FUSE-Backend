const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createCardSchema, updateCardSchema, updatePINSchema, updateBalanceSchema } = require('./validationSchemas');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

router.get('/', encryptResponse, cardController.index);
router.post('/', decryptRequest, encryptResponse, validateRequest(createCardSchema), cardController.store);
router.post('/account/:id', encryptResponse, cardController.showByAccountId);
router.post('/user', encryptResponse, cardController.showByUserId);
router.post('/:id', encryptResponse, cardController.show);
router.put('/pin/:id', decryptRequest, encryptResponse, validateRequest(updatePINSchema), cardController.updatePIN);
router.put('/balance/:id', decryptRequest, encryptResponse, validateRequest(updateBalanceSchema), cardController.updateBalance);
//router.put('/:id', validateRequest(updateCardSchema), cardController.update);
router.delete('/:id', encryptResponse, cardController.destroy);

module.exports = router;
