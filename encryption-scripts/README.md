# Encrypted Request & Response Handling Guide

This guide explains how to generate encrypted request bodies, send encrypted requests, and decrypt responses using **RSA and AES encryption**.

---

## 1️⃣ Generate Login & Register Bodies (RSA Encryption)

To create encrypted login and register request bodies:

1. **Run `RSAencryption.js`**  
2. **Save the generated encrypted bodies**  
3. **Copy the generated `AESkey`** and paste it into `AESencryption.js`  

---

## 2️⃣ Send an Encrypted Request (AES Encryption)

To send a request with AES-encrypted data:

1. **Edit the request bodies** in `AESencryption.js`  
2. **Run `AESencryption.js`** to encrypt the data  
3. **Save the encrypted body** for use in API requests  

---

## 3️⃣ Decrypt a Response (AES Decryption)

To decrypt an encrypted server response:

1. **Replace the `resBodyEncrypted` value** with the received encrypted response  
2. **Set the encryption boolean to `false`** in `AESencryption.js` (switch to decryption mode)  
3. **Run `AESencryption.js`** to view the decrypted response  

---

## 🔹 Notes

- Ensure you are using the correct **AES key** for both encryption and decryption.  
- The **encryption boolean** in `AESencryption.js` determines whether the script encrypts or decrypts.  
- Always save and verify encrypted bodies before using them in API requests.  

---

📌 **Example Commands**:

```sh
# Generate RSA-encrypted bodies
node RSAencryption.js  

# Encrypt request body with AES
node AESencryption.js  

# Decrypt response body
node AESencryption.js  
