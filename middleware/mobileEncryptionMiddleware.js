const forge = require('node-forge');
const { handleError } = require('./errorMiddleware');
const userService = require('../services/userService');
const { getAESKey, setAESKey } = require('./keysDB/keysDB');

// In-memory storage for RSA key pairs
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

// AES Key Exchange
async function getAESkey(req, res) {
  try {
    const { email, encryptedAesKey } = req.body;
    const user = await userService.findByEmail(email);
    console.log(`user ${user.id} is trying to get AES key`);

    if (!user) {
      throw createError('Not Found', 404, 'User not found');
    }

    const decryptedAesKey = rsaPairs[user.id].privateKey.decrypt(
      forge.util.decode64(encryptedAesKey),
      'RSA-OAEP'
    );

    await setAESKey(user.id, decryptedAesKey.toString('hex'));
    rsaPairs[user.id] = null;

    return res.status(200).json({ done: "success" });
  } catch (error) {
    await handleError(error, res, req);
  }
}

// Decryption Middleware
async function decryptionMobile(req, res, next) {
  if (!req.body.payload) return next();

  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid or missing JWT token' });
    }

    const { payload } = req.body;
    const key = await getAESKey(userId);
    req.body = JSON.parse(decryptData(payload, key));

    console.log('Message Decrypted');
    next();
  } catch (error) {
    console.error('Error decrypting message:', error);
    res.status(500).json({ error: "Failed to decrypt message" });
  }
}

// Payload Creation
async function makePayloadMobile(data, userId, email) {
  try {
    const user = userId ? 
      await userService.findById(userId) : 
      await userService.findByEmail(email);

    if (!user) {
      throw createError('Not Found', 404, 'User not found');
    }

    const aesKey = await getAESKey(user.id);
    if (!aesKey) {
      throw createError('Key not found', 404, 'AES key not found for the user');
    }

    const payload = encryptMobile(data, aesKey);
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

// Utility Functions
function createError(message, code, errorMessage) {
  const error = new Error(message);
  error.meta = { code: code.toString(), error: errorMessage };
  return error;
}

async function getUserId(req) {
  if (!req.body.email && !req.user) {
    throw new Error("Can't find keys without email or JWT");
  }
  const user = req.body.email ? await userService.findByEmail(req.body.email) : null;
  return user ? user.id : (req.user ? req.user.id : undefined);
}

module.exports = {
  genPublicKey,
  getAESkey,
  decryptionMobile,
  encryptMobile,
  makePayloadMobile
};
