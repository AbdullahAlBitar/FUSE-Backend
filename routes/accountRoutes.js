const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { createAccountSchema, updateAccountSchema } = require('./validationSchemas');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

router.get('/', encryptResponse, accountController.index);
router.post('/',decryptRequest, encryptResponse, validateRequest(createAccountSchema), accountController.store);
router.post('/user', decryptRequest, encryptResponse, accountController.showUserAccounts);
router.post('/user/:id', decryptRequest, encryptResponse, accountController.showUserById);
router.post('/:id', encryptResponse, accountController.show);
router.put('/:id', decryptRequest, encryptResponse, validateRequest(updateAccountSchema), accountController.update);
router.delete('/:id', encryptResponse, accountController.destroy);

module.exports = router;
