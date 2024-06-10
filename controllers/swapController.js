

import { swapTokens as swapTokensExactOutService, swapTokens as swapTokensExactInService} from '../services/swapService.js';

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

export async function transferTokens(req, res) {
    const { fromSecretKey, toPublicKey, amount } = req.body;

    if (!fromSecretKey || !toPublicKey || !amount) {
        return res.status(400).send('Missing required parameters');
    }

    try {
        const signature = await transferSOL(fromSecretKey, toPublicKey, amount);
        res.status(200).json({ signature });
    } catch (error) {
        console.error('Error during transfer:', error);
        res.status(500).send('Transfer failed');
    }
}
