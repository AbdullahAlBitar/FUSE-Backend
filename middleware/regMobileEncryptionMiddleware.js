const forge = require('node-forge');
const { handleError } = require('./errorMiddleware');
const userService = require('../services/userService');
const { getAESKey, setAESKey } = require('./keysDB/keysDB');

// In-memory storage
const keys = {};
const rsaPairs = {};

// Registration Public Key Generation
async function genPublicKeyForReg(req, res) {
  try {
    const { email } = req.body;
    const existingUser = await userService.findByEmail(email);

    if (existingUser) {
      throw createError('User already exists', 409, 'Email is already Registered');
    }

    const rsaKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicKeyPem = forge.pki.publicKeyToPem(rsaKeyPair.publicKey);
    rsaPairs[email] = rsaKeyPair;

    console.log(`Public key for user ${email} is sent`);
    return res.status(200).json({ publicKey: publicKeyPem });
  } catch (error) {
    await handleError(error, res, req);
  }
}

// AES Key Exchange for Registration
async function getAESkey(req, res) {
  try {
    const { email, encryptedAesKey } = req.body;
    
    if (!rsaPairs[email]) {
      throw createError('Not Found', 404, 'Email not found');
    }
    
    console.log(`user ${email} is trying to get AES key for registration`);

    const decryptedAesKey = rsaPairs[email].privateKey.decrypt(
      forge.util.decode64(encryptedAesKey), 
      'RSA-OAEP'
    );

    keys[email] = decryptedAesKey.toString('hex');
    rsaPairs[email] = null;

    return res.status(200).json({ done: "success" });
  } catch (error) {
    await handleError(error, res, req);
  }
}

// Registration Decryption Middleware
async function decryptionMobile(req, res, next) {
  if (!req.body.payload) return next();

  try {
    if (!req.body.email) {
      return res.status(400).json({ error: "Can't find keys without email" });
    }

    const { email, payload } = req.body;
    const key = keys[email];
    req.body = JSON.parse(decryptData(payload, key));

    console.log('Message Decrypted');
    next();
  } catch (error) {
    console.error('Error decrypting message:', error);
    res.status(500).json({ error: "Failed to decrypt message" });
  }
}

// Registration Payload Creation
async function makePayloadRegMobile(data, userId, email) {
  try {
    if (!email) {
      throw createError('Not Found', 404, 'Email not found for making payload');
    }

    const aesKey = keys[email];
    if (!aesKey) {
      throw createError('Key not found', 404, 'AES key not found for the user');
    }

    await setAESKey(userId, aesKey);
    const payload = encryptMobile(data, aesKey);
    keys[email] = null;

    return { payload };
  } catch (error) {
    console.error('Error creating payload:', error);
    throw error;
  }
}

// Encryption Helper
function encryptMobile(data, aesKey) {
  try {
    const iv = forge.random.getBytesSync(12);
    const cipher = forge.cipher.createCipher('AES-GCM', forge.util.hexToBytes(aesKey));
    
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(JSON.stringify(data), 'utf8'));
    cipher.finish();

    const encrypted = cipher.output.getBytes();
    const authTag = cipher.mode.tag.getBytes();
    
    console.log('data encrypted successfully');
    return forge.util.encode64(
      forge.util.createBuffer(iv)
        .putBytes(encrypted)
        .putBytes(authTag)
        .getBytes()
    );
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

// Decryption Helper
function decryptData(encryptedData, aesKey) {
  try {
    const decodedData = forge.util.decode64(encryptedData);
    const iv = decodedData.slice(0, 12);
    const encrypted = decodedData.slice(12, decodedData.length - 16);
    const authTag = decodedData.slice(decodedData.length - 16);

    const decipher = forge.cipher.createDecipher('AES-GCM', forge.util.hexToBytes(aesKey));
    decipher.start({
      iv,
      tagLength: 128,
      tag: authTag
    });
    
    decipher.update(forge.util.createBuffer(encrypted));
    const pass = decipher.finish();

    if (pass) {
      console.log('data decrypted successfully');
      return decipher.output.toString('utf8');
    }
    throw new Error('Authentication failed during decryption');
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

// Utility Function
function createError(message, code, errorMessage) {
  const error = new Error(message);
  error.meta = { code: code.toString(), error: errorMessage };
  return error;
}

module.exports = {
  genPublicKeyForReg,
  getAESkey,
  decryptionMobile,
  makePayloadRegMobile
};
