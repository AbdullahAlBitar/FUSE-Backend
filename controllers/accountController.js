const accountService = require('../services/accountService');
const { logServer } = require('./logController'); 

async function index(req, res, next) {
  try {
    const allAccounts = await accountService.findAll();
    await logServer(req, res);
    return res.json({allAccounts});
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const id = req.params.id;

    const account = await accountService.findById(id);

    await logServer(req, res);

    return res.json({account});
  } catch (error) {
    next(error);
  }
}

async function showUserAccounts(req, res, next) {
  try {
    const accounts = await accountService.findByUserId(req.user.id);

    await logServer(req, res);

    return res.json({accounts});

  } catch (error) {
    next(error);
  }
}

async function showUserById(req, res, next) {
  try {
    const accountUser = await accountService.findUserById(req.params.id);

    await logServer(req, res);

    return res.json({accountUser});
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const userId = req.user.id;
    const { type } = req.body;

    const newAccount = await accountService.create(userId, "0", type);

    await logServer(req, res);

    return res.json({newAccount});
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

    return res.json({updatedAccount});
  } catch (error) {
    next(error)
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id ;

    const deletedAccount = await accountService.updateById(id, { status: "Inactive" });

    await logServer(req, res);

    return res.json({ message: 'Account deleted successfully' });
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
