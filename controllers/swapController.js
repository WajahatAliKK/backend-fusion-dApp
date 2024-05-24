

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

