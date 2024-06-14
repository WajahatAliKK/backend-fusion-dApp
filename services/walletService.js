import { Keypair, Connection } from '@solana/web3.js';
import { MongoClient } from 'mongodb';
import bs58 from 'bs58';
import crypto from 'crypto';
import { swapTokens, swapInstructions } from './swapService.js';

const dbName = 'cluster1';
const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const rpcEndpoint = 'https://ultra-delicate-lambo.solana-mainnet.quiknode.pro/9e6a18285b47f9974b7cac73e999be568cfe9929/';
const solanaConnection = new Connection(rpcEndpoint);

async function connectToMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}

async function encryptPrivateKey(secretKeyBase58) {
    try {
        const encryptionKey = process.env.ENCRYPTION_KEY; 
        if (!encryptionKey) {
            throw new Error('Encryption key not found in environment variables');
        }

        const iv = crypto.randomBytes(16); 
        const ivHex = iv.toString('hex'); 

        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
        let encryptedPrivateKey = cipher.update(secretKeyBase58, 'utf8', 'base64');
        encryptedPrivateKey += cipher.final('base64');

        return { encryptedPrivateKey, iv: ivHex  };
    } catch (error) {
        throw new Error('Error encrypting private key: ' + error.message);
    }
}

async function createWalletAndSaveToMongoDB(publicAddress) {
    try {
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const secretKeyBase58 = keypair.secretKey.toString('base64');
        console.log(secretKeyBase58);
        const balance = await solanaConnection.getBalance(keypair.publicKey);
  
        const encryptedPrivateKey = await encryptPrivateKey(secretKeyBase58);
        const providedPublicAddress = publicAddress

        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');

  
        const existingWallet = await collection.findOne({ providedPublicAddress: publicAddress });

        if (existingWallet) {
            await client.close();
            throw new Error('Public address already exists in the database');
        }
        
        const result = await collection.insertOne({providedPublicAddress ,publicKey, encryptedPrivateKey, balance });

        await client.close();

        const insertedId = result.insertedId;

        return {
            data: {
                _id: insertedId,
                publicKey,
                encryptedPrivateKey,
                balance,
                providedPublicAddress,
            },
        };
    } catch (error) {
        throw new Error('Error creating wallet and keypairs or saving data to MongoDB: ' + error.message);
    }
}

async function getDataFromMongoDB() {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');
        const data = await collection.find({}).toArray();
        await client.close();
        
        return { data };
    } catch (error) {
        throw new Error('Error fetching data from MongoDB');
    }
}

// async function decryptPrivateKey(encryptedPrivateKey, ivHex , encryptionKey) {
//     try {
//         if (!encryptionKey) {
//             throw new Error('Encryption key not provided');
//         }
  
//         const iv = Buffer.from(ivHex, 'hex'); 
  
//         const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
//         let decryptedPrivateKey = decipher.update(encryptedPrivateKey, 'base64', 'utf8');
//         decryptedPrivateKey += decipher.final('utf8');
//         return decryptedPrivateKey;
//     } catch (error) {
//         throw new Error('Error decrypting private key: ' + error.message);
//     }
// }
// async function getWalletByAddress(address) {
//     try {
//         const client = await connectToMongoDB();
//         const db = client.db(dbName);
//         const collection = db.collection('newcollection');
//         const walletData = await collection.findOne({ publicKey: address });
//         await client.close();

//         return walletData;
//     } catch (error) {
//         throw new Error('Error fetching wallet data from MongoDB: ' + error.message);
//     }
// }

async function decryptPrivateKey(encryptedPrivateKey, ivHex , encryptionKey) {
    try {
        if (!encryptionKey) {
            throw new Error('Encryption key not provided');
        }
  
        const iv = Buffer.from(ivHex, 'hex'); 
  
        const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);

        
        let decryptedPrivateKey = decipher.update(encryptedPrivateKey, 'base64', 'utf8');
    
        decryptedPrivateKey += decipher.final('utf8');

        let numbersAsString = decryptedPrivateKey.split(',');

        let uint8Array = new Uint8Array(numbersAsString.length);

        for (let i = 0; i < numbersAsString.length; i++) {
            let intValue = parseInt(numbersAsString[i], 10);
            uint8Array[i] = intValue;
        }

        console.log(uint8Array);
        const privateKey = bs58.encode(uint8Array)
        return privateKey;
    } catch (error) {
        throw new Error('Error decrypting private key: ' + error.message);
    }
}
async function getWalletByAddress(address) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');
        const walletData = await collection.findOne({ providedPublicAddress: address });

        await client.close();

        if (!walletData) {
            throw new Error('Wallet data not found for address: ' + address);
        }

        return walletData;
    } catch (error) {
        throw new Error('Error fetching wallet data from MongoDB: ' + error.message);
    }
}





export { createWalletAndSaveToMongoDB, getDataFromMongoDB, decryptPrivateKey, getWalletByAddress };
