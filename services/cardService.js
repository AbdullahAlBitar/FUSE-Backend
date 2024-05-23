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
  return await prisma.cards.findUnique({
    where: { id },
  });
}

async function create(id, accountNumber) {
  return await prisma.cards.create({
    data: {
      id,
      accountNumber: parseInt(accountNumber),
      cvv: Math.floor(Math.random() * 900) + 100,
    }
  });
}

async function updateById(id, { data }) {
  if (data.expiryDate) data.expiryDate = new Date(data.expiryDate).toISOString();
  return await prisma.cards.update({
    where: { id },
    data
  });
}

async function deleteCard(id) {
  return await prisma.cards.delete({
    where: { id },
  });
}

module.exports = {
  findAll,
  findById,
  create,
  updateById,
  deleteCard,
};
