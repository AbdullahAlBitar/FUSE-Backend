const userService = require('../services/userService');
const { makePayload } = require('../middleware/encryptionMiddleware');
const { makePayloadMobile } = require('../middleware/mobileEncryptionMiddleware');
const { logServer } = require('./logController'); // Import the logServer function

async function index(req, res, next) {
  try {
    const allUsers = await userService.findAll();
    await logServer(req, res); 
    return res.json(await makePayload(allUsers, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function show(req, res, next) {
  try {
    const id = parseInt(await validate.isNumber(req.params.id, "id"));
    const user = await userService.findById(id);

    await logServer(req, res); 
    return res.json(await makePayload(user, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = req.params.id;
    const { name, email, phone, birth, status } = req.body;

    const updatedUser = await userService.updateUser(id, name, email, phone, birth, status);
    await logServer(req, res); 
    return res.status(200).json(await makePayload(updatedUser, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function destroy(req, res, next) {
  try {
    const id = req.params.id;
    const deletedUser = await userService.deleteUser(id);

    if (!deletedUser) {
      let error = new Error("Not Found");
      error.meta = { code: "404", error: 'User not found' };
      throw error;
    }
    await logServer(req, res); 
    return res.json(await makePayload({ message: 'User deleted successfully' }, req.user.id));
  } catch (error) {
    next(error);
  }
}

async function recived(req, res){
  const userId = req.user.id;
  
  const recivedAmounts = await userService.findRecived(parseInt(userId));
  
  await logServer(req, res);
  return res.json(await makePayloadMobile({recived: recivedAmounts}, req.user.id));
}

async function sent(req, res){
  const userId = req.user.id;
  
  const sentAmounts = await userService.findSent(parseInt(userId));
  
  await logServer(req, res);
  return res.json(await makePayloadMobile({sent: sentAmounts}, req.user.id));
}

async function expenses(req, res, next) {
  const userId = req.user.id;
  
  const user = await userService.findCustomer(userId);

  const userExpenses = await userService.findExpenses(userId);
  
  await logServer(req, res);
  return res.json(await makePayloadMobile({expenses: userExpenses, monthlyIncome: user.customer.monthlyIncome}, req.user.id));
}

module.exports = { index, show, update, destroy, recived, sent, expenses };
