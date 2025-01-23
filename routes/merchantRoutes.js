const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { validateRequest } = require('../middleware/validationMiddleware');
const { updateMerchantSchema, generateMerchantBill } = require('./validationSchemas');

// router.get('/create', merchantController.create);
router.get('/', merchantController.index);
router.get('/:id', merchantController.show);
router.put('/:id', validateRequest(updateMerchantSchema), merchantController.update);
router.delete('/:id', merchantController.destroy);

module.exports = router;