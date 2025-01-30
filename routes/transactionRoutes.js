const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { isEmployee } = require('../middleware/authRole');
const { 
    createTransferSchema,
    createBillSchema, 
    createDWSchema, 
    payBillSchema, 
    updateTransactionSchema 
} = require('./validationSchemas');
const { decryptRequest, encryptResponse, decryptRSA } = require('../middleware/encryptionMiddleware');

//router.get('/create', transactionController.create);

router.post('/all', encryptResponse, transactionController.index);
router.post("/topUp", decryptRequest, encryptResponse, transactionController.showTopUp);
router.post('/fromTo', decryptRequest, encryptResponse, transactionController.showTransactionsFromTo);
router.post('/cash/deposit', isEmployee, decryptRequest, encryptResponse, validateRequest(createDWSchema), transactionController.storeDeposit);
router.post('/cash/withdraw', isEmployee, decryptRequest, encryptResponse, validateRequest(createDWSchema), transactionController.storeWithdraw); 

router.post('/transfer', decryptRequest, encryptResponse, encryptResponse, validateRequest(createTransferSchema), transactionController.storeTransfer);

router.post('/:id', transactionController.show);
router.put('/:id', validateRequest(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.destroy);

module.exports = router;
