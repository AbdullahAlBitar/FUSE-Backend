const userService = require('../services/userService');
const { saveAESKey } = require('../middleware/keysDB/keysDB');

async function publicKey(req, res) {
  const publicKey = process.env.RSA_PUBLIC_KEY;
  res.json({ publicKey });
}

async function setAESKey(req, res) {
  const { email, encryptedAESKey } = req.body;
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
      await saveAESKey(user.id, decryptedMessage);
      return res.status(200).json("AES key received");
  } catch (error) {
      res.status(400).json({ error: 'Decryption failed' });
  }
}


module.exports = {
  setAESKey,
  publicKey
}