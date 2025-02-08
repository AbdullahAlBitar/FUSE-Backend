const crypto = require("crypto");

const publicKey = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAuFPDgLl60odCSrg0sAYF
94nm/NKl2PYjeyAvWYfMdxA/oK48HFOdTYLBeyxaSGv2kHmHBkzIXsi0OVpQHlcT
eTmErQ02nENWSR8o6hZBdqHGl9e6MzUMZsW/jQEIiKizJ8ZkYklPjp6W3XvbFZJT
jiIdYygTTxToT8j4R9rzvBYQVsFVeLMCoabKm1U5UL4KsdrL9sSWifq8TJJLXBRg
YcUEwpZmlQMWIege7Mwxy4haR3DnsyAKz8HgCpUUAE/K16qR4nGRIYVHxMOpxh5G
0BzRp9ORWfK9XFW7k+Cv3ZPcwHsUCn5NnAk4yQyTehOWuDUAiiG4sbx2lspMXhgy
ffJrkrTH7wymFgQ7e2M2uIvCt+/HIPNFUkvrmmEkMKpA9zkhCsLoT1jIFyTu0oqv
Af7pbTibXoWvX3uVIhyWTbUWBjyZDk41ha3zC9boCLKCYN23ZBsrb2FuqVqZcai8
J+YgrQZowXBEqogtl63gnG1Mmuh5EAnD1d7+49bdNftcVgip6FPFjCC6nbuRQQGu
l3lYhOoHBXN9Xa97czlkyP3zCfta7guKxRbu+xH5oeaiwdJlMYqDMq/VpntgiQEc
2tg6KmayC7RuwrhUdj2O8ZiLHWEcf3hPpHwzzlli8jazNseYfGc4cGmRsg7uUoXG
aRn8KlIV90UKML+ZM+PX2gkCAwEAAQ==
-----END PUBLIC KEY-----`;

const aesKey = crypto.randomBytes(32).toString("hex");

console.log("Generated AES Key:", aesKey);

const bodies = [
    { email: "abdullah@mail.com", password: "Abd@1234", AESkey: aesKey }, // login
    { name: "abdullah", role: "Customer", email: "abdullah@mail.com", phone: "0987654322", birth: "1/1/2000", password: "Abd@1234", rPassword: "Abd@1234" }, // register
];

// Function to encrypt a body using RSA-OAEP (matching server decryption)
const encryptBody = (body) => {
    const buffer = Buffer.from(JSON.stringify(body), "utf8");
    const encrypted = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, // Match server
            oaepHash: "sha256", // Match server
        },
        buffer
    );
    return encrypted.toString("base64");
};

const encryptedBodies = bodies.map(body => encryptBody(body));

console.log("Bodies:");
bodies.forEach((body, index) => {
    console.log(`Body ${index + 1}:`, body);
    console.log(`encrypted ${index + 1}:\n`, encryptedBodies[index]);
});
