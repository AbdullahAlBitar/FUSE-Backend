const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const validate = require('../middleware/validationMiddleware');
const merchantService = require('./merchantService');
const accountService = require('./accountService');
const cardService = require('./cardService');


async function findById(id) {
  id = await validate.checkEmpty(req.params.id, "id");

	const bill = await prisma.bills.findUnique({
		where: {
			id: parseInt(id),
		},
		include: {
			merchantAccount: {
				select: {
					user: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	});

  if (!bill) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: "Bill not found" };
    throw error;
  }
  return bill;
}

async function findByMerchantId(id) {
  const merchantAccount = await prisma.accounts.findFirst({
    where: {
      user: {
        id
      },
      type: "Checking",
    }
  });

  return await prisma.bills.findMany({
    where: {
      merchantAccountNumber: merchantAccount.id,
      status: "Pending"
    },
  });
}

async function create(id, amount, details) {
  const user = await merchantService.findById(id)
  const dAccount = await accountService.findCheckingById(id);

  if (!dAccount) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Destination account not found' };
    throw error;
  } else if (dAccount.status !== "Active") {
    let error = new Error("Not Active");
    error.meta = { code: "409", error: `Destination account is not active (${dAccount.status})` };
    throw error;
  } else if (amount <= 0) {
    let error = new Error("Wrong Amount");
    error.meta = { code: "409", error: "Amount must be greater than 0" };
    throw error;
  }

	const category = await prisma.merchantCategory.findUnique({
		where: {
			id: parseInt(user.merchant.categoryId),
		},
	});

	return await prisma.bills.create({
		data: {
			merchantAccountNumber: merchantAccount,
			amount: amount,
			details: details ? details : "",
			category: category.name,
		},
	});
}

async function payBill(id, cardId, cvv, month, year) {
  id = parseInt(await validate.checkEmpty(id, "id"))
  const bill = await findById(id);
  const card = await cardService.findById(cardId);
  const expiryDate = new Date(card.expiryDate);

  if (!bill) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Bill not found' };
    throw error;
  } else if (!card) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Card not found' };
    throw error;
  } else if (card.cvv !== cvv, expiryDate.getMonth() + 1 !== parseInt(month), expiryDate.getFullYear() !== parseInt(year)) {
    let error = new Error("Invalid Card Details");
    error.meta = { code: "409", error: `Card details are invalid` };
    throw error;
  } else if (bill.status !== "Pending") {
    let error = new Error("Not Pending");
    error.meta = { code: "409", error: `Bill is not pending (${bill.status})` };
    throw error;
  }

  if (card.balance - bill.amount < 0) {
    let error = new Error("Insufficient Balance");
    error.meta = { code: "409", error: `Card has insufficient balance` };
    throw error;
  }

  const transaction = await prisma.$transaction([
    prisma.bills.update({
      where: { id: bill.id },
      data: {
        status: "Paid",
        cardId,
        payedAt: new Date()
      }
    }),
    prisma.cards.update({
      where: {
        id: cardId
      },
      data: {
        balance: { decrement: amount }
      }
    }),
    prisma.accounts.update({
      where: {
        id: merchantAccount
      },
      data: {
        balance: { increment: amount }
      }
    })
  ]);

  if (!transaction) {
    throw new Error('Transaction failed');
  }

  return transaction;
}


module.exports = {
  create,
  findById,
  payBill,
  findByMerchantId
}