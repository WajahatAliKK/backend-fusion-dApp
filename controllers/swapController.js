// import { swapTokensExactOut, swapTokensExactIn, getSwapInstructions } from '../services/swapService.js';

import { swapTokens as swapTokensExactOutService, swapTokens as swapTokensExactInService} from '../services/swapService.js';

export async function swapTokensExactOut(req, res) {
    const { inputMint, outputMint, amount ,address } = req.body;
    try {
        const swapResponse = await swapTokensExactOutService(inputMint, outputMint, amount , 'ExactOut',address);
        res.status(200).json({ message: 'Swap successful', swapResponse });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during the swap' });
    }
}

export async function swapTokensExactIn(req, res) {
    const { inputMint, outputMint, amount  , address} = req.body;
    try {
        const swapResponse = await swapTokensExactInService(inputMint, outputMint, amount, 'ExactIn' ,address);
        res.status(200).json({ message: 'Swap successful', swapResponse });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during the swap' });
    }
}

