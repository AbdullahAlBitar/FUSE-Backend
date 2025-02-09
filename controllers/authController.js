const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const userService = require('../services/userService');
const authService = require('../services/authService');
const accountService = require('../services/accountService');
const merchantService = require('../services/merchantService');
const customerService = require('../services/customerService');

const { revokedTokens } = require('../middleware/authMiddleware');
const { logServer } = require('./logController');
const { saveAESKey } = require('../middleware/keysDB/keysDB');

const secretKey = process.env.JWT_SECRET;
const maxAge = 30 * 60 * 1000;

async function register(req, res, next) {
  try {
    const { name, role, email, phone, birth, password } = req.body;
    const { category, workPermit } = req.body;
    const { monthlyIncome } = req.body;

    const newUser = await userService.create(name, role, email, phone, birth, password);
    const account = await accountService.create(newUser.id, "0", "Checking");

    try {
      if (role === "Merchant") {
        await merchantService.create(newUser.id, category, workPermit);
      } else if (role === "Customer") {
        await customerService.create(newUser.id, parseInt(monthlyIncome));
      }
    } catch (error) {
      await userService.deleteUserFromDB(newUser.id);
      throw error;
    }

    await logServer(req, res); 
    return res.status(200).json({ userId: newUser.id  });

  } catch (error) {
    next(error);
  }
}

async function registerEmployee(req, res, next) {
  try {
    const { name, email, phone, birth, password } = req.body;

    const newUser = await userService.create(name, "Employee", email, phone, birth, password);
    const account = await accountService.create(newUser.id, "0", "Checking");

    if (newUser && account) {
      console.log("New Employee created successfully ID", newUser.id);
      await logServer(req, res); 
      res.status(201).json({newUser});
    } else {
      console.log("Error creating new Employee");
      await logServer(req, res); 
      res.status(400).json({ message: 'Error creating new Employee' });
    }

  } catch (error) {
    next(error);
  } 
}

async function login(req, res, next) {
  try {
    const { email, password, AESkey } = req.body;

    const user = await authService.emailLogin(email, password);

    const userAccounts = await accountService.findCheckingById(user.id);

    await saveAESKey(user.id, AESkey);

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '30m' });
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });


    await logServer(req, res); 
    return res.json({ jwt: token, user, userAccounts });
  } catch (error) {
    next(error);
  }
}

async function loginDashboard(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await authService.emailLogin(email, password);

    if (!["Admin", "Employee"].includes(user.role)) {
      let error = new Error("Unauthorized");
      error.meta = { code: "401", error: 'User not unauthorized to login' };
      throw error;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '30m' });
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge });
    
    await logServer(req, res); 
    return res.json({ jwt: token });

  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.body.jwt;

    revokedTokens.add(token);

    res.clearCookie('jwt');
    await logServer(req, res); 
    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout, loginDashboard, registerEmployee };
