const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findAll() {
  return await prisma.cards.findMany({
    orderBy: [{ expiryDate: "desc" }],
    select: {
      id: true,
      accountNumber: true,
      expiryDate: true,
    }
  });
}

async function findById(id) {
  await prisma.cards.update({
    where: { id },
    data: {
      physical: true
    }
  });

  const card = await prisma.cards.findUnique({
    where: { id },
  });

  if (!card) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: "Card not found" };
    throw error;
  }
  return card;
}

async function findByAccountId(id) {
  const cards = await prisma.cards.findMany({
    where: { accountNumber: id },
    orderBy: [{ expiryDate: "desc" }],
  });

  if (!cards) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: "Cards not found" };
    throw error;
  }
  return cards;
}

async function findByUserId(id) {
  const cards = await prisma.cards.findMany({
    where: {
      account: {
        userId: id
      }
    }
  });

  if (!cards) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: "Cards not found" };
    throw error;
  }
  return cards;
}

async function create(userId, cardName, accountNumber, PIN, balance) {
  const checkingAccount = await accountService.findCheckingById(
    userId
  );

  if (!checkingAccount) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: "No User Checking Account" };
    throw error;
  }

  if (checkingAccount.balance - balance < 0) {
    let error = new Error("Insufficient Balance");
    error.meta = {
      code: "409",
      error: "Checking Account has insufficient balance",
    };
    throw error;
  }

  let id, checkID;
  do {
    let randomNumber = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;
    id = randomNumber.toString();

    checkID = await prisma.cards.findUnique({
      where: { id }
    });
  } while (checkID);

  let transaction = [];

  transaction.push(
    prisma.cards.create({
      data: {
        id,
        cardName,
        balance,
        accountNumber: accountNumber,
        cvv: Math.floor(Math.random() * 900) + 100,
        PIN
      }
    })
  )
  transaction.push(
    prisma.accounts.update({
      where: {
        id: accountNumber
      },
      data: {
        balance: { decrement: balance }
      }
    })
  )

  return await prisma.$transaction(transaction);
}

async function updateById(id, data) {
  if (data.expiryDate) data.expiryDate = new Date(data.expiryDate).toISOString();
  return await prisma.cards.update({
    where: { id },
    data
  });
}

async function updateBalance(id, amount, type) {
  const card = await prisma.cards.findUnique({
    where: { id },
  });

  let transaction = [];

  transaction.push(
    prisma.cards.update({
      where: { id },
      data: {
        balance: type === "Deposit" ? { increment: amount } : { decrement: amount }
      }
    })
  )

  transaction.push(
    prisma.accounts.update({
      where: {
        id: card.accountNumber
      },
      data: {
        balance: type === "Deposit" ? { decrement: amount } : { increment: amount }
      }
    })
  )

  return await prisma.$transaction(transaction);
}

async function deleteCard(id, userId) {
  const card = await prisma.cards.findUnique({
    where: { id },
  });

  if (!card) console.log("cant find card");

  let transaction = [];

  transaction.push(
    prisma.accounts.update({
      where: {
        id: card.accountNumber
      },
      data: {
        balance: { increment: card.balance }
      }
    })
  )

  transaction.push(
    prisma.cards.delete({
      where: { id, account: { user: { id: userId } } }
    })
  )


  return await prisma.$transaction(transaction);
}

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteCard,
  findByAccountId,
  findByUserId,
  updateBalance
};
