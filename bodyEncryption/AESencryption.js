const crypto = require("crypto");

const secretKey = "f7afAp3Ng+joADaGxsNIYdrHD3qq79u2ZBB0SInWZZk="; // genrated in RSA for login
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);

const encryption = 0;

const encryptBody = (body) => {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'base64'), iv);
    let encrypted = cipher.update(JSON.stringify(body), "utf8", "base64");
    encrypted += cipher.final("base64");
    return { iv: iv.toString("base64"), encryptedData: encrypted };
};

const decryptBody = (encryptedBody) => {
    const decipher = crypto.createDecipheriv(
        algorithm,
        Buffer.from(secretKey, 'base64'),
        Buffer.from(encryptedBody.iv, 'base64')
    );
    let decrypted = decipher.update(encryptedBody.encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
};

if (encryption) {
    const bodies = [
        { type: "Savings" },
    ];

    const encryptedBodies = bodies.map(body => encryptBody(body));

    console.log("Original and Encrypted/Decrypted Bodies:");
    bodies.forEach((body, index) => {
        console.log(`\nBody ${index + 1}:`);
        console.log("Original:", body);
        console.log("Encrypted:", encryptedBodies[index]);
    });
} else {
    const resBodyEncrypted = {
        iv: "yPKhAXLx+DGxESlFmuCPOQ==",
        encryptedData: "EpCvLot0j1ivcgg3b0nbkZOAxA4TygeCzo8a4xfCfbcatLVsdBJWwdvrRlcygFkbEr4QC1ZbjCZ4lhWQ4e/i43kOaZsSlySnTno325iGQhssZHkYmrlE4EkgJFkJ/vzLAnAe1K5kAoPOy9iQP7kO3BwGBvQ6gWypUybCZgHhat4NwGspKJ8YhAhW8jdy8oMEfhAoW44Hy2wvp9hYYLzv1cS9eVxUAqcd3rn/pLb03Bk="
    }

    console.log("DecryptedResBody:", JSON.stringify(decryptBody(resBodyEncrypted), null, 2));
}