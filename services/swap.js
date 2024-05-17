
import {  VersionedTransaction  ,Connection, Keypair, Transaction, TransactionInstruction} from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import axios from 'axios';
import { config } from 'dotenv';
config();
import { MongoClient } from 'mongodb';

import crypto from 'crypto';
const connection = new Connection('https://ultra-delicate-lambo.solana-mainnet.quiknode.pro/9e6a18285b47f9974b7cac73e999be568cfe9929/');


const dbName = 'cluster1';
const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}



const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.error("Private key is missing. Make sure you set the PRIVATE_KEY environment variable.");
  process.exit(1);
}

// const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(privateKey)));


async function getSwapQuote(inputMint, outputMint, amount ,swapMode) {
    try {
      const quoteResponse = await axios.get(`https://quote-api.jup.ag/v6/quote`, {
        params: {
          inputMint,
          outputMint,
          amount,
          swapMode : swapMode
          
        }
      });
  
      if (!quoteResponse || !quoteResponse.data) {
        throw new Error('Failed to fetch quote. Response data is missing.');
      }
  
      return quoteResponse.data;
    } catch (error) {
      console.error("An error occurred while fetching quote:", error);
      throw error; 
    }
  }




// this works fine and perfect
// export async function swapTokens(inputMint,outputMint,amount,swapMode) {
//     try {

//         if (!inputMint || !outputMint || isNaN(amount)) {
//                     console.error("Invalid input. Please provide valid mint addresses and a numeric amount.");
//                  return;
//        }
              
//         const quoteData = await getSwapQuote(inputMint, outputMint, amount,swapMode);
       
//          console.log('quoteResponse:', quoteData);
//          quoteData.routePlan.forEach((plan, index) => {
//         console.log(`Route Plan ${index + 1}:`);
//         console.dir(plan.swapInfo, { depth: null });
//       });
  
//       const swapTokensResponse = await axios.post('https://quote-api.jup.ag/v6/swap', {
//         quoteResponse: quoteData,
//         userPublicKey: wallet.publicKey.toString(),
//         swapMode : swapMode,
//       });
  
//       const swapTokens = swapTokensResponse.data;
  
//       if (!swapTokens || swapTokens.error) {
//         throw new Error(`Failed to  swap . Error: ${swapTokens && swapTokensResponse.error}`);
//       }
  
//       console.log('swapTokens:');
//       console.dir(swapTokens, { depth: null });
//       return {
//         quoteResponse: quoteData,
//         swapTokens
//     };
//     } catch (error) {
//       console.error("An error occurred:", error);
//   }
// }

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

export async function swapInstructions(inputMint,outputMint,amount) {
    try {

        if (!inputMint || !outputMint || isNaN(amount)) {
                    console.error("Invalid input. Please provide valid mint addresses and a numeric amount.");
                 return;
       }
              
        const quoteData = await getSwapQuote(inputMint, outputMint, amount);
       
         console.log('quoteResponse:', quoteData);
         quoteData.routePlan.forEach((plan, index) => {
        console.log(`Route Plan ${index + 1}:`);
        console.dir(plan.swapInfo, { depth: null });
      });
  
      const swapInstructionsResponse = await axios.post('https://quote-api.jup.ag/v6/swap-instructions', {
        quoteResponse: quoteData,
        userPublicKey: wallet.publicKey.toString(),
      });
  
      const swapInstructions = swapInstructionsResponse.data;
  
      if (!swapInstructions || swapInstructions.error) {
        throw new Error(`Failed to get swap instructions. Error: ${swapInstructions && swapInstructions.error}`);
      }
  
      console.log('swapInstructions:');
      console.dir(swapInstructions, { depth: null });
      return {
        quoteResponse: quoteData,
        swapInstructions
    };
    } catch (error) {
      console.error("An error occurred:", error);
  }
}





export async function swapTokens(inputMint, outputMint, amount, swapMode, address) {
  try {
    console.log(address);
    // Connect to MongoDB and fetch wallet data
    const client = await connectToMongoDB();
    const db = client.db(dbName);
    const collection = db.collection('newcollection');
    const walletData = await collection.findOne({ publicKey: address });
    await client.close();

    if (!walletData) {
      throw new Error('Wallet data not found for address: ' + address);
    }
    console.log(walletData);

    const encryptionKey = process.env.ENCRYPTION_KEY;
    // Decrypt the private key
    // const { encryptedPrivateKey, iv, publicKey } = walletData;
    // const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
     const { encryptedPrivateKey: { encryptedPrivateKey, iv } } = walletData;
    //  console.log(encryptedPrivateKey);
    //  console.log(iv);
    // // Call decryptPrivateKey function passing parameters separately
     const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
    // Split the string into individual numbers and parse them
    const numbers = decryptedPrivateKey.split(',').map(Number);

    // Create a Uint8Array from the parsed numbers
    const uint8Array = new Uint8Array(numbers);
    console.log(uint8Array);
    console.log(typeof(uint8Array))
    // Create the wallet
    const wallet = new Wallet(Keypair.fromSecretKey(uint8Array));

    // Existing swap logic
    if (!inputMint || !outputMint || isNaN(amount)) {
      console.error("Invalid input. Please provide valid mint addresses and a numeric amount.");
      return;
    }

    const quoteData = await getSwapQuote(inputMint, outputMint, amount, swapMode);

    console.log('quoteResponse:', quoteData);
    quoteData.routePlan.forEach((plan, index) => {
      console.log(`Route Plan ${index + 1}:`);
      console.dir(plan.swapInfo, { depth: null });
    });

    const swapInstructionsResponse = await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse: quoteData,
      userPublicKey: wallet.publicKey.toString(),
      swapMode,
    });

    const swapTokens = swapInstructionsResponse.data;

    if (!swapTokens || swapTokens.error) {
      throw new Error(`Failed to swap. Error: ${swapTokens && swapTokens.error}`);
    }

    console.log('swapTokens:', swapTokens);

    const { swapTransaction } = swapTokens;
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    transaction.sign([wallet.payer]);

    const rawTransaction = transaction.serialize();
    const latestBlockhash = await connection.getLatestBlockhash();

    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 2,
    });

   const transactionResult =  `https://solscan.io/tx/${txid}`;

    return {
      quoteResponse: quoteData,
      swapTokens,
      transactionResult
    };
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
