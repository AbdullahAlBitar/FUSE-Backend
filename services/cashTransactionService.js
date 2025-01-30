const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create(type, account, amount, supervisorId) {
  if (amount <= 0) {
    let error = new Error("Wrong Amount");
    error.meta = { code: "409", error: "Amount must be greater than 0" };
    throw error;
  }

  return await prisma.cashTransactions.create({
    data: { type, accountNumber: account, amount, supervisorId }
  })
}

async function updateById(id, data) {
  return await prisma.cashTransactions.update({ where: { id }, data });
}

async function findAllTopUp() {
  const transactions = await prisma.cashTransactions.findMany({
    where: {
      type: 'Deposit'
    },
    include: {
      supervisor: {
        select: {
          name: true,
          role: true
        }
      },
      account: {
        select: {
          user: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  if (!transactions) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'TopUp not found/Empty' };
    throw error;
  }
  return transactions;
}

module.exports = {
  create,
  updateById,
  findAllTopUp
};