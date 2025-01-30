const cardService = require("../services/cardService");
const accountService = require("../services/accountService");
const validate = require("./validateController").default;
const { makePayload } = require("../middleware/encryptionMiddleware");
const { logServer } = require('./logController');

async function index(req, res, next) {
  try {
    const allCards = await cardService.findAll();
    await logServer(req, res);
    return res.json({allCards});
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");

    const card = await cardService.findById(id);

    await logServer(req, res);
    return res.json({card});
  } catch (error) {
    next(error);
  }
}

async function showByAccountId(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");

    const cards = await cardService.findByAccountId(id);

    await logServer(req, res);
    return res.json({cards});
  } catch (error) {
    next(error);
  }
}

async function showByUserId(req, res, next) {
  try {
    const cards = await cardService.findByUserId(req.user.id);

    await logServer(req, res);
    return res.json({cards});
  } catch (error) {
    next(error);
  }
}

async function store(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");
    const { cardName, balance, PIN } = req.body;

    const newCard = await cardService.create(
      id,
      cardName,
      checkingAccount.id,
      PIN,
      balance
    );

    await logServer(req, res);
    return res.json({newcard :newCard[0]});
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");

    const { cardName, accountNumber, expiryDate, physical } = req.body;

    const updatedCard = await cardService.updateById(id, {
      cardName,
      accountNumber,
      expiryDate,
      physical,
    });
    await logServer(req, res);
    res.json({updatedCard});
  } catch (error) {
    next(error);
  }
}

async function updateBalance(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");
    const { amount, type } = req.body;

    if (type === "Deposit") {
      const checkingAccount = await accountService.findCheckingById(
        req.user.id
      );
      if (checkingAccount.balance - amount < 0) {
        let error = new Error("Insufficient Balance");
        error.meta = {
          code: "409",
          error: "Checking Account has insufficient balance",
        };
        throw error;
      }
    } else {
      const card = await cardService.findById(id);
      if (card.balance - amount < 0) {
        let error = new Error("Insufficient Balance");
        error.meta = {
          code: "409",
          error: "Card has insufficient balance",
        };
        throw error;
      }
    }

    const updatedCard = await cardService.updateBalance(
      id,
      amount,
      type,
    );

    if (!updatedCard) {
      let error = new Error("Failed");
      error.meta = { code: "409", error: "Failed to update balance" };
      throw error;
    }
    await logServer(req, res);
    return res.json({updatedCard : updatedCard[0]});

  } catch (error) {
    next(error);
  }
}

async function updatePIN(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");
    const { PIN } = req.body;

    const updatedCard = await cardService.updateById(id, { PIN });
    await logServer(req, res);
    res.json({updatedCard});
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const id = await validate.checkEmpty(req.params.id, "id");

    const deletedCard = await cardService.deleteCard(id, req.user.id);

    if (!deletedCard) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: "Card not found" };
      throw error;
    }
    await logServer(req, res);
    return res.json({ message: "Card deleted successfully" });
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
  updatePIN,
  showByAccountId,
  showByUserId,
  updateBalance
};
