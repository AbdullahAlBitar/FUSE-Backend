const crypto = require('crypto');
const { getAESKey } = require('./keysDB/keysDB');
const userService = require('../services/userService')

const ALGORITHM = 'aes-256-cbc';

async function decryptRequest(req, res, next) {
  const { iv, encryptedData } = req.body;

  const SHARED_KEY = await getAESKey(req.user.id);
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SHARED_KEY, 'base64'),
    Buffer.from(iv, 'base64')
  );

  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  req.body = JSON.parse(decrypted);
  next();
}

async function encryptResponse(req, res, next) {
  const originalJson = res.json;
  const SHARED_KEY = await getAESKey(req.user.id);

  res.json = function (data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(SHARED_KEY, 'base64'),
      iv
    );

    const jsonData = JSON.stringify(data);
    let encrypted = cipher.update(jsonData, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return originalJson.call(this, {
      iv: iv.toString('base64'),
      encryptedData: encrypted
    });
  };

  next();
}

async function decryptRSA(req, res, next) {
  try {
    const { encryptedBody } = req.body;
    if (!encryptedBody) {
      return res.status(400).json({ error: 'Missing encrypted body' });
    }

    const privateKey = process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n');

    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedBody, 'base64')
    );

    req.body = JSON.parse(decryptedBuffer.toString('utf8'));
    next();
  } catch (error) {
    console.error('RSA Decryption Error:', error);
    res.status(400).json({ error: 'Decryption failed' });
  }
}

module.exports = decryptRSA;


module.exports = { decryptRequest, encryptResponse, decryptRSA };
