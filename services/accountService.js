const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validate = require('../controllers/validateController');

async function findAll() {
  return await prisma.accounts.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      type: true,
      createdAt: true
    }
  });
}

async function findById(id) {
  id = await validate.isNumber(id, 'id');

  const account =  await prisma.accounts.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      type: true,
      balance: true,
      status: true,
      user: {
        select:{
          role: true,
        }
      }
    }
  });

  if (!account) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Account not found' };
    throw error;
  }

  return account;
}

async function findByUserId(id){
  id = await validate.isNumber(id, 'id');

  const accounts = await prisma.accounts.findMany({
    where: {
      userId: parseInt(id),
    },
    select: {
      id: true,
      name: true,
      type: true,
      balance: true,
      status: true,
    }
  });

  if(!accounts){
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Accounts not found' };
    throw error;
  }

  return accounts;
}

async function findUserById(accountId) {
  accountId = await validate.isNumber(accountId, 'Account ID');

  const accountUser =  await prisma.accounts.findUnique({
    where: {
      id: accountId
    },
    include: {
      user: true
    }
  });

  if(!accountUser){
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Accounts not found' };
    throw error;
  }

  return accountUser;
}

async function findCheckingById(userId) {
  userId = await validate.isNumber(userId, 'User ID');

  const account = await prisma.accounts.findFirst({
    where:{
      user: { id: parseInt(userId) },
      type: "Checking"
    }
  });

  if (!account) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Account not found' };
    throw error;
  }

  return account;
}

async function create(userId, balance, type) {
  userId = await validate.isNumber(userId, 'User ID');
  balance = await validate.isNumber(balance, 'Balance');

  let newAccountNumber = "";
  let account = null;
  do {
    prefix = "7053";
    let randomSuffix = Math.floor(Math.random() * 9000000000000000) + 1000000000000000;

    newAccountNumber = (prefix + randomSuffix);
    account = prisma.accounts.findUnique({
      where: newAccountNumber
    })
  } while (!account);

  return await prisma.accounts.create({
    data: {
      id: newAccountNumber,
      userId: parseInt(userId),
      balance: parseFloat(balance),
      type,
      name: `${type}_${userId}_FUSE`
    }
  });
}

async function updateById(id,  data) {
  id = await validate.isNumber(id, "id");

  const updatedAccount = await prisma.accounts.update({
    where: {
      id: id
    },
    data
  });

  if (!updatedAccount) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'Account not found' };
    throw error;
  }

  return updatedAccount;
}

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  findByUserId,
  findCheckingById,
  findUserById
};
