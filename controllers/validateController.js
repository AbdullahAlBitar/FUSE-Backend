async function isNumber(number, name) {
  number = await checkEmpty(number, name);
  if (isNaN(number)) {
    error = new Error(`Invaled ${name}`);
    error.meta = { error: `Invaled ${name} must be a number`, paramName: name };
    throw error;
  }
  return number;
}

async function checkEmpty(parameter, paramName) {
  if (!parameter || parseInt(String.toString(parameter).trim().length) <= 0) {
    error = new Error("Empty parameter");
    error.meta = { error: `Empty parameter`, paramName };
    throw error;
  }
  return parameter.toString().trim();
}

module.exports = {
  isNumber, 
  checkEmpty 
};
