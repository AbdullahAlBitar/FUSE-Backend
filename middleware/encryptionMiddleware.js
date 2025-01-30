const crypto = require('crypto');
const { getAESKey } = require('./keysDB/keysDB');

const ALGORITHM = 'aes-256-cbc';

function decryptRequest(req, res, next) {
  const { iv, encryptedData } = req.body;

  const SHARED_KEY = getAESKey(req.user.id);
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

function encryptResponse(req, res, next) {
  const originalJson = res.json;
  const SHARED_KEY = getAESKey(req.user.id);

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
  const { encryptedBody } = req.body;
  const privateKey = process.env.RSA_PRIVATE_KEY;

  const user = await userService.findByEmail(email);

  try {
      const decryptedBuffer = crypto.privateDecrypt(
          {
              key: privateKey,
              padding: crypto.constants.RSA_PKCS1_PADDING,
          },
          Buffer.from(encryptedAESKey, 'base64')
      );

      const decryptedMessage = decryptedBuffer.toString('utf8');
      req.body = JSON.parse(decryptedMessage);
  } catch (error) {
      res.status(400).json({ error: 'Decryption failed' });
  }
}

module.exports = { decryptRequest, encryptResponse, decryptRSA };
