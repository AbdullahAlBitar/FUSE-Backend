const merchantService = require('../services/merchantService');
const billServices = require('../services/billServices');
const accountService = require('../services/accountService');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { logServer } = require('./logController');

async function index(req, res, next) {
  try {
    const allMerchants = await merchantService.findAll();
    await logServer(req, res);
    return res.json(await makePayload(allMerchants, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const id = req.params.id;

    const merchant = await merchantService.findById(id);

    await logServer(req, res); 
    return res.json(await makePayload(merchant, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const { name, email, phone, birth, status, category, workPermit } = req.body;

    const oldMerchant = await merchantService.findById(id);

    const updatedMerchant = await merchantService.updateById(id, { name, email, phone, birth, status, category, workPermit });
    await logServer(req, res); 
    return res.status(200).json(await makePayload(updatedMerchant, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id;

    const deletedMerchant = await merchantService.deleteMerchant(id);

    await logServer(req, res); 
    return res.json(await makePayload({ message: 'Merchant deleted successfully' }, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function genBill(req, res, next) {
  try {
    const { merchantId, amount, details, password } = req.body;

    const merchant = await merchantService.findById(merchantId);

    const merchantAccount = await accountService.findCheckingById(merchantId);

    const bill = await billServices.create(merchantAccount.id, amount, details, merchant.merchant.categoryId);

    logServer(req, res);
    return res.status(201).json({ billID: bill.id })
  } catch (error) {
    next(error);
  }
}

async function checkBill(req, res, next) {
  try {
    const billId = parseInt(await validate.isNumber(req.params.id));
    const bill = await billServices.findById(billId);

    logServer(req, res);
    return res.status(201).json({ status: bill.status })

  } catch (error) {
    next(error);
  }
}

module.exports = { index, show, update, destroy, genBill, checkBill };
