const billService = require('../services/billServices');
const cardService = require('../services/cardService');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

async function show(req, res, next) {
  try {
    const bill = await billService.findById(id);

    await logServer(req, res);
    return res.json(await makePayloadMobile(bill, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const { amount, details } = req.body;

    const bill = await billService.create(req.user.id, amount, details);

    await logServer(req, res);
    res.status(201).json(await makePayloadMobile({ bill }, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function pay(req, res, next) {
  try {
    const id = req.params.id;
    const { cardId, cvv, month, year } = req.body;

    const payedBill = await billService.payBill(id, cardId, cvv, month, year);
    await logServer(req, res);
    return res.status(201).json(await makePayloadMobile({ payedBill }, req.user.id));

  } catch (error) {
    next(error);
  }
}

async function showUnpaid(req, res, next) {
  try {
    const bills = await billService.findByMerchantId(req.user.id);
    await logServer(req, res);
    return res.json(await makePayloadMobile(bills, req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  store,
  pay,
  show,
  showUnpaid
}
