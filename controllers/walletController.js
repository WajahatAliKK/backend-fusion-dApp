import { createWalletAndSaveToMongoDB, getDataFromMongoDB,  getWalletByAddress as getWalletByAddressService  , decryptPrivateKey} from '../services/walletService.js';


export async function createWallet(req, res) {
    try {
        const { publicAddress } = req.params;
        if (!publicAddress) {
            throw new Error('Missing publicAddress');
        }
        const walletData = await createWalletAndSaveToMongoDB(publicAddress);
        res.json(walletData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getAllWallets(req, res) {
    try {
        const data = await getDataFromMongoDB();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getWalletByAddress(req, res) {
    try {
        const { address } = req.params;
        console.log(address)
        const walletData = await getWalletByAddressService(address);
        res.json({ data: walletData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getDecryptedKey  (req, res) {
    try {
        const { encryptedPrivateKey, ivHex, encryptionKey } = req.body;
        
        const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, ivHex, encryptionKey);
        res.json({ decryptedPrivateKey });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}