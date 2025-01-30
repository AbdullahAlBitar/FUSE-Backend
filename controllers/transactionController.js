const transactionService = require('../services/transactionService');
const cashTransactionService = require('../services/cashTransactionService');
const merchantService = require('../services/merchantService');
const accountService = require('../services/accountService');
const { handleError } = require('../middleware/errorMiddleware');
const validate = require('./validateController').default;
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController');

async function index(req, res, next) {
  try {
    const allTransactions = await transactionService.findAll();
    console.log("sending all transactions");
    await logServer(req, res);
    return res.json(await makePayload(allTransactions, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const id = req.params.id;
    const transaction = await transactionService.findById(id);

    await logServer(req, res);
    return res.json(await makePayload(transaction, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function showTransactionsFromTo(req, res, next) {
  try {
    const { sourceRole, destinationRole } = req.body;
    const transactions = await transactionService.findAllFromTo(sourceRole, destinationRole);

    console.log("transactions from ", sourceRole, " to ", destinationRole, " are going to be returned");
    await logServer(req, res);
    return res.json(await makePayload(transactions, req.user.id));

  } catch (error) {
    next(error);
  }
}

async function showTopUp(req, res, next) {
  try {
    transactions = await cashTransactionService.findAllTopUp();

    console.log("TopUp is ready to be sent");
    await logServer(req, res);
    return res.status(201).json(await makePayload(transactions, req.user.id));
  } catch (error) {
    await handleError(error, res)
  }
}

async function storeTransfer(req, res, next) {
  try {
    const { type, destinationAccount, sourceAccount, amount, details } = req.body;

    const dAccount = await accountService.findById(destinationAccount);
    let sAccount = await accountService.findCheckingById(req.user.id);
    if (sourceAccount) {
      sAccount = await accountService.findById(sourceAccount);
    }

    const transaction = await transactionService.create(type, sAccount.id, dAccount.id, amount);
    if (details) transactionService.addTransactionDetails(transaction.id, details);

    if ((sAccount.balance - amount) < 0) {
      await transactionService.updateById(transaction.id, { status: "Failed" });
      let error = new Error("Insufficient Balance");
      error.meta = { code: "409", error: "Source account has insufficient balance" };
      throw error;
    }

    const transactions = await transactionService.makeTransfer(transaction.id, sAccount, dAccount, amount);

    if (!transactions) {
      await transactionService.updateById(transaction.id, { status: "Failed" });
      let error = new Error("Failed");
      error.meta = { code: "409", error: "Failed to complete transaction" };
      throw error;
    }

    console.log(type, " is done form", sAccount.id, " to ", dAccount.id, " with amount", amount);
    await logServer(req, res);
    return res.status(201).json(await makePayloadMobile({ transactions }, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function storeDeposit(req, res, next) {
  try {
    const { account, amount } = req.body;

    const Account = await accountService.findById(account);
    const supervisorId = req.user.id;

    let transaction = await cashTransactionService.create("Deposit", account, amount, supervisorId);

    const deposit = await accountService.updateById(account, { balance: { increment: amount } });
    if (!deposit) {
      transaction = await cashTransactionService.updateById(transaction.id, { status: "Failed" });
      let error = new Error("Failed");
      error.meta = { code: "409", error: "Failed to complete deposit" };
      throw error;
    }

    transaction = await cashTransactionService.updateById(transaction.id, { status: "Completed" });

    await logServer(req, res);
    return res.status(201).json(await makePayload({ transaction }, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function storeWithdraw(req, res, next) {
  try {
    const { account, amount } = req.body;

    const Account = await accountService.findById(account);
    const supervisorId = req.user.id;

    if ((Account.balance - amount) < 0) {
      let error = new Error("Insufficient Balance");
      error.meta = { code: "409", error: "Account has insufficient balance" };
      throw error;
    }

    let transaction = await cashTransactionService.create("Withdraw", account, amount, supervisorId);

    const withdraw = await accountService.updateById(account, { balance: { decrement: amount } });
    if (!withdraw) {
      transaction = await cashTransactionService.updateById(transaction.id, { status: "Failed" });
      let error = new Error("Failed");
      error.meta = { code: "409", error: "Failed to complete withdraw" };
      throw error;
    }

    transaction = await cashTransactionService.updateById(transaction.id, { status: "Completed" });

    await logServer(req, res);
    return res.status(201).json(await makePayload({ transaction }, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const { sourceAccount, destinationAccount, amount } = req.body;

    const oldTransaction = await transactionService.findById(id);
    let result = "";

    const oldSourceAccount = await accountService.findById(oldTransaction.sourceAccount);
    const oldDestinationAccount = await accountService.findById(oldTransaction.destinationAccount);

    if (sourceAccount != oldTransaction.sourceAccount) {
      const newSourceAccount = await accountService.findById(sourceAccount);

      if (newSourceAccount.balance - amount < 0) {
        let error = new Error("Insufficient Balance");
        error.meta = { code: "409", error: "New Source has insufficient balance" };
        throw error;
      }
      const transactions = await transactionService.changeSourceAccount(id, oldSourceAccount, newSourceAccount, oldTransaction.amount, amount);
      if (transactions) {
        result += "Source account changed from " + oldSourceAccount.id + " to " + newSourceAccount.id + "\n";
      }
    }

    if (destinationAccount != oldTransaction.destinationAccount) {
      const newDestinationAccount = await accountService.findById(destinationAccount);

      if (oldDestinationAccount.balance - oldTransaction.amount < 0) {
        let error = new Error("Insufficient Balance");
        error.meta = { code: "409", error: "Old Destination has insufficient balance" };
        throw error;
      }
      const transactions = await transactionService.changeDestinationAccount(id, oldDestinationAccount, newDestinationAccount, oldTransaction.amount, amount);
      if (transactions) {
        result += "Destination account changed from " + oldDestinationAccount.id + " to " + newDestinationAccount.id + "\n";
      }
    }

    if (result === "" && amount != oldTransaction.amount) {
      if (oldSourceAccount.balance - (amount - oldTransaction.amount) < 0) {
        let error = new Error("Insufficient Balance");
        error.meta = { code: "409", error: "Source Account has insufficient balance" };
        throw error;
      }

      const transactions = await transactionService.changeAmount(id, amount, oldTransaction.amount);
      result += "Amount changed from " + oldTransaction.amount + " to " + amount + "\n";
    }
    if (result === "") { result = "Nothing changed" }
    //console.log(result);

    await logServer(req, res);
    return res.status(200).json(await makePayload(result, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function patchDeposit(req, res, next) {

}

async function patchWithdraw(req, res, next) {

}

async function destroy(req, res, next) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const oldTransaction = await transactionService.deleteById(id);


    await logServer(req, res);
    return res.status(200).json(await makePayload("Transaction deleted", req.user.id));
  } catch (error) {
    next(error);
  }

}

module.exports = {
  index,
  show,
  storeTransfer,
  storeDeposit,
  storeWithdraw,
  update,
  destroy,
  showTransactionsFromTo,
  showTopUp,
  patchDeposit,
  patchWithdraw
};
