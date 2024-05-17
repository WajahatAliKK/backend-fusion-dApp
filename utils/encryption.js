import crypto from 'crypto';

async function encryptPrivateKey(secretKeyBase58, encryptionKey) {
    try {
        if (!encryptionKey) {
            throw new Error('Encryption key not provided');
        }

        const iv = crypto.randomBytes(16);
        const ivHex = iv.toString('hex');

        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
        let encryptedPrivateKey = cipher.update(secretKeyBase58, 'utf8', 'base64');
        encryptedPrivateKey += cipher.final('base64');

        return { encryptedPrivateKey, iv: ivHex };
    } catch (error) {
        throw new Error('Error encrypting private key: ' + error.message);
    }
}

async function decryptPrivateKey(encryptedPrivateKey, ivHex, encryptionKey) {
    try {
        if (!encryptionKey) {
            throw new Error('Encryption key not provided');
        }

        const iv = Buffer.from(ivHex, 'hex');

        const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
        let decryptedPrivateKey = decipher.update(encryptedPrivateKey, 'base64', 'utf8');
        decryptedPrivateKey += decipher.final('utf8');

        return decryptedPrivateKey;
    } catch (error) {
        throw new Error('Error decrypting private key: ' + error.message);
    }
}

export { encryptPrivateKey, decryptPrivateKey };
