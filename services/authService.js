const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function emailLogin(email, password) {
  const user = await prisma.users.findUnique({
    where:{
      email
    }
  });

  if (!user) {
    let error = new Error("Not Found");
    error.meta = { code: "404", error: 'User not found' };
    throw error;
  } else if (await bcrypt.compare(password, user.password)) {
    return user;
  } else {
    let error = new Error("Wrong password");
    error.meta = { code: "409", error: 'Password is wrong' };
    throw error;
  }
}

module.exports = {
  emailLogin,
};
