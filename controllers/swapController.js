

import { swapTokens as swapTokensExactOutService, swapTokens as swapTokensExactInService , transferSOL, withdraw, getRecentData,getItemsBySource} from '../services/swapService.js';

export async function swapTokensExactOut(req, res) {
    const { inputMint, outputMint, amount ,address,slippageBps } = req.body;
    try {
        const swapResponse = await swapTokensExactOutService(inputMint, outputMint, amount , 'ExactOut',address,slippageBps);
        res.status(200).json({ message: 'Swap successful', swapResponse });
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}


export async function swapTokensExactIn(req, res) {
    const { inputMint, outputMint, amount  , address,slippageBps} = req.body;
    try {
        const swapResponse = await swapTokensExactInService(inputMint, outputMint, amount, 'ExactIn' ,address,slippageBps);
        res.status(200).json({ message: 'Swap successful', swapResponse });
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}

export async function widthrawSol(req, res) {
    const { fromPublicKey, toPublicKey, amount } = req.body;

    if (!fromPublicKey || !toPublicKey || !amount) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const signature = await withdraw(fromPublicKey, toPublicKey, amount);
        res.status(200).json({ signature });
    } catch (error) {
        console.error('Error during transfer:', error);
        res.status(500).send('Transfer failed');
    }
}


export async function getNewPairs(req, res) {

    try {
        const recentData = await getRecentData();
        res.json(recentData);
    } catch (error) {
        console.error('Error in /recent-data endpoint:', error);
        res.status(500).json({ error: 'Failed to fetch recent data', details: error.message });
    }
}

export async function dexFilter(req, res)  {
    const { choice } = req.query;
    try {
        const items = await getItemsBySource(parseInt(choice, 10));
        res.json(items);
    } catch (error) {
        res.status(500).send('Error fetching items');
    }
}
