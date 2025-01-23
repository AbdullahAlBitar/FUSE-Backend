const accountService = require('../services/accountService');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController'); 
const { makePayloadRegMobile } = require('../middleware/regMobileEncryptionMiddleware');

async function index(req, res, next) {
  try {
    const allAccounts = await accountService.findAll();
    await logServer(req, res);
    return res.json(await makePayload(allAccounts, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const id = req.params.id;

    const account = await accountService.findById(id);

    await logServer(req, res);

    return res.json(await makePayloadMobile(account, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function showUserAccounts(req, res, next) {
  try {
    const accounts = await accountService.findByUserId(req.user.id);

    await logServer(req, res);

    return res.json(await makePayloadMobile(accounts, req.user.id));

  } catch (error) {
    next(error);
  }
}

async function showUserById(req, res, next) {
  try {
    const accountUser = await accountService.findUserById(req.params.id);

    await logServer(req, res);

    return res.json(await makePayloadMobile(accountUser, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const userId = req.user.id;
    const { type } = req.body;

    const newAccount = await accountService.create(userId, 0, type);

    await logServer(req, res);

    return res.json(await makePayloadRegMobile(newAccount, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const { userId, balance, type, status, name } = req.body;

    const updatedAccount = await accountService.updateById(id, { userId, balance, type, status, name });

    await logServer(req, res);

    return res.json(await makePayload(updatedAccount, req.user.id));
  } catch (error) {
    next(error)
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id ;

    const deletedAccount = await accountService.updateById(id, { status: "Inactive" });

    await logServer(req, res);

    return res.json(await makePayload({ message: 'Account deleted successfully' }, req.user.id));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  showUserById,
  showUserAccounts
};
