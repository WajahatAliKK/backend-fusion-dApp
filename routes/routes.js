

import express from 'express';
import { createWallet, getAllWallets, getWalletByAddress ,getDecryptedKey } from '../controllers/walletController.js';
import { getQuickBuySettings, getQuickSellSettings, setQuickBuySettings, setQuickSellSettings } from '../controllers/settingsController.js';
import { swapTokensExactOut, swapTokensExactIn, widthrawSol , getNewPairs ,dexFilter} from '../controllers/swapController.js';
const router = express.Router();

router.get('/createWalletAndSaveToMongoDB/:publicAddress', createWallet);
router.get('/getDataFromMongoDB', getAllWallets);
router.get('/wallet/:address', getWalletByAddress);
router.post('/settings/quickbuy', setQuickBuySettings);
router.get('/settings/getQuickBuySettings/:publicAddress', getQuickBuySettings);
router.post('/settings/quickSell', setQuickSellSettings);
router.get('/settings/getQuickSellSettings/:publicAddress', getQuickSellSettings);
// router.post('/swapTokensExactOut', swapTokensExactOut);
// router.post('/swapTokensExactIn', swapTokensExactIn);
router.post('/getPrivateKey', getDecryptedKey);
// router.post('/swap-instructions', getSwapInstructions);
router.post('/widthrawSol', widthrawSol);
router.get('/recent-data', getNewPairs);
router.get('/dexFilter',dexFilter);
router.get('/getdataByCriteria' , getdataByCriteria);

export default router;
