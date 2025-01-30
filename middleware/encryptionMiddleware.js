const crypto = require('crypto');
const forge = require('node-forge');
const { handleError } = require('./errorMiddleware');
const userService = require('../services/userService');
const { getAESKey, setAESKey } = require('./keysDB/keysDB');

// In-memory storage
const rsaPairs = {};

// RSA Key Generation
async function genPublicKey(req, res) {
  try {
    const { email } = req.body;
    const user = await userService.findByEmail(email);
    console.log(`user ${user.id} is trying to get Public key`);

    if (!user) {
      throw createError('Not Found', 404, 'User not found');
    }

    const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
    rsaPairs[user.id] = rsaKeyPair;

    console.log(`Public key for user ${user.id} is sent`);
    return res.status(200).json({ publicKey: publicKeyPem });
  } catch (error) {
    await handleError(error, res, req);
  }
}

// ECDH Key Generation for Dashboard
async function genKeysDashboard(req, res) {
  try {
    const { email, clientPublicKey } = req.body;
    const user = await userService.findByEmail(email);

    if (!user) {
      throw createError('Not Found', 404, 'User not found');
    }

    if (!['Admin', 'Employee'].includes(user.role)) {
      throw createError('Unauthorized', 403, 'User not authorized');
    }

    const serverKeys = generateECDHKeys(clientPublicKey);
    await setAESKey(user.id, serverKeys.sharedKey);

    console.log(`Shared Key for ${email} is sent`);
    return res.json({ serverPublicKey: serverKeys.publicKey });
  } catch (error) {
    await handleError(error, res, req);
  }
}

// Middleware for decrypting incoming requests
async function decryption(req, res, next) {
  if (!req.body.payload) return next();

  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing JWT token' });
    }

    const { payload } = req.body;
    const key = await getAESKey(userId);
    req.body = JSON.parse(decrypt(payload, key));

    console.log('Message Decrypted');
    next();
  } catch (error) {
    console.error('Error decrypting message:', error);
    res.status(500).json({ error: 'Failed to decrypt message' });
  }
}

// Encryption handler
async function encryption(data, userId, email) {
  try {
    const finalUserId = email ? (await getUserIdFromEmail(email)) : userId;
    if (!finalUserId) return null;

    const stringifiedData = JSON.stringify(data);
    const key = await getAESKey(finalUserId);
    const encrypted = encrypt(stringifiedData, key);

    console.log('Message encrypted');
    return encrypted;
  } catch (error) {
    console.error('Error encrypting data:', error);
    throw new Error('Failed to encrypt data');
  }
}

// AES encryption helper
function encrypt(message, sharedKey) {
  const IV = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), IV);

  const encrypted = cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  const payload = IV.toString('hex') + encrypted + authTag;

  return Buffer.from(payload, 'hex').toString('base64');
}

// AES decryption helper
function decrypt(payload, sharedKey) {
  const payloadHex = Buffer.from(payload, 'base64').toString('hex');
  const iv = payloadHex.slice(0, 32);
  const encrypted = payloadHex.slice(32, -32);
  const authTag = payloadHex.slice(-32);

  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(sharedKey, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

// Payload creation helper
async function makePayload(data, userId, email) {
  console.log('Payload is in making');
  const payload = await encryption(JSON.stringify(data), userId, email);
  return { payload };
}

// Utility functions
function createError(message, code, errorMessage) {
  const error = new Error(message);
  error.meta = { code: code.toString(), error: errorMessage };
  return error;
}

function generateECDHKeys(clientPublicKey) {
  const server = crypto.createECDH('prime256v1');
  server.generateKeys();
  return {
    publicKey: server.getPublicKey().toString('base64'),
    sharedKey: server.computeSecret(Buffer.from(clientPublicKey, 'base64'), null, 'hex')
  };
}

async function getUserId(req) {
  if (!req.body.email && !req.user) {
    throw new Error("Can't find keys without email or JWT");
  }
  const user = req.body.email ? await userService.findByEmail(req.body.email) : null;
  return user ? user.id : (req.user ? req.user.id : undefined);
}

async function getUserIdFromEmail(email) {
  const user = await userService.findByEmail(email);
  return user ? user.id : null;
}

module.exports = {
  genPublicKey,
  encryption,
  decryption,
  makePayload,
  genKeysDashboard,
};
