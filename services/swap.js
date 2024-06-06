
import {  VersionedTransaction  ,Connection, Keypair, Transaction, TransactionInstruction} from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import axios from 'axios';
import { config } from 'dotenv';
config();
import { MongoClient } from 'mongodb';

import crypto from 'crypto';
const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/kgYyEi-DvcfTHEiTGeO7LGbPEJ5lofWm');


const dbName = 'cluster1';
const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
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



// work fine slipagge issue and also transection sattaus is not defined here 

// export async function swapTokens(inputMint, outputMint, amount, swapMode, address) {
//   try {
//     console.log(address);
//     // Connect to MongoDB and fetch wallet data
//     const client = await connectToMongoDB();
//     const db = client.db(dbName);
//     const collection = db.collection('newcollection');
//     const walletData = await collection.findOne({ publicKey: address });
//     await client.close();

//     if (!walletData) {
//       throw new Error('Wallet data not found for address: ' + address);
//     }
//     console.log(walletData);

//     const encryptionKey = process.env.ENCRYPTION_KEY;
//     // Decrypt the private key
//     // const { encryptedPrivateKey, iv, publicKey } = walletData;
//     // const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
//      const { encryptedPrivateKey: { encryptedPrivateKey, iv } } = walletData;
//     //  console.log(encryptedPrivateKey);
//     //  console.log(iv);
//     // // Call decryptPrivateKey function passing parameters separately
//      const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
//     // Split the string into individual numbers and parse them
//     const numbers = decryptedPrivateKey.split(',').map(Number);

//     // Create a Uint8Array from the parsed numbers
//     const uint8Array = new Uint8Array(numbers);
//     console.log(uint8Array);
//     console.log(typeof(uint8Array))
//     // Create the wallet
//     const wallet = new Wallet(Keypair.fromSecretKey(uint8Array));

//     // Existing swap logic
//     if (!inputMint || !outputMint || isNaN(amount)) {
//       console.error("Invalid input. Please provide valid mint addresses and a numeric amount.");
//       return;
//     }

//     const quoteData = await getSwapQuote(inputMint, outputMint, amount, swapMode);

//     console.log('quoteResponse:', quoteData);
//     quoteData.routePlan.forEach((plan, index) => {
//       console.log(`Route Plan ${index + 1}:`);
//       console.dir(plan.swapInfo, { depth: null });
//     });

//     const swapInstructionsResponse = await axios.post('https://quote-api.jup.ag/v6/swap', {
//       quoteResponse: quoteData,
//       userPublicKey: wallet.publicKey.toString(),
//       swapMode,
//     });

//     const swapTokens = swapInstructionsResponse.data;

//     if (!swapTokens || swapTokens.error) {
//       throw new Error(`Failed to swap. Error: ${swapTokens && swapTokens.error}`);
//     }

//     console.log('swapTokens:', swapTokens);

//     const { swapTransaction } = swapTokens;
//     const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
//     const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

//     transaction.sign([wallet.payer]);

//     const rawTransaction = transaction.serialize();
//     const latestBlockhash = await connection.getLatestBlockhash();

//     const txid = await connection.sendRawTransaction(rawTransaction, {
//       skipPreflight: true,
//       maxRetries: 2,
//     });

//    const transactionResult =  `https://solscan.io/tx/${txid}`;

//     return {
//       quoteResponse: quoteData,
//       swapTokens,
//       transactionResult
//     };
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// }

// here is updated one 


export async function swapTokens(inputMint, outputMint, amount, swapMode, address ,slippageBps) {
  try {
    console.log(address);

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
    // const { encryptedPrivateKey, iv, publicKey } = walletData;
    // const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
    const { encryptedPrivateKey: { encryptedPrivateKey, iv } } = walletData;
    const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
    const numbers = decryptedPrivateKey.split(',').map(Number);


    const uint8Array = new Uint8Array(numbers);
    console.log(uint8Array);
    console.log(typeof(uint8Array))

    const wallet = new Wallet(Keypair.fromSecretKey(uint8Array));


    if (!inputMint || !outputMint || isNaN(amount)) {
      console.error("Invalid input. Please provide valid mint addresses and a numeric amount.");
      return;
    }

    const quoteData = await getSwapQuote(inputMint, outputMint, amount, swapMode);
    const modifiedQuoteData = {
      ...quoteData, 
      slippageBps: slippageBps 
  };

  console.log("Modified Quote Data:", modifiedQuoteData)

    quoteData.routePlan.forEach((plan, index) => {
      console.log(`Route Plan ${index + 1}:`);
      console.dir(plan.swapInfo, { depth: null });
    });

    const swapInstructionsResponse = await axios.post('https://quote-api.jup.ag/v6/swap', {
      quoteResponse: modifiedQuoteData,
      userPublicKey: wallet.publicKey.toString(),
      swapMode
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
   const transactionStatus = await getTransactionStatus(txid);
    return {
      quoteResponse: modifiedQuoteData,
      swapTokens,
      transactionResult,
      transactionStatus

    };
  } catch (error) {
    console.error("An error occurred:", error);
    throw error; // Throw the error to be caught by the caller 
  }
}

// async function getTransactionStatus(transactionSignature) {
//   try {
//       console.log(`Fetching status for transaction signature: ${transactionSignature}`);
//       const statusResponse = await connection.getSignatureStatuses([transactionSignature]);
//       const status = statusResponse && statusResponse.value[0];
      
//       if (status) {
//           console.log('Transaction Status:');
//           console.log(`- Confirmation Status: ${status.confirmationStatus}`);
//           console.log(`- Confirmations: ${status.confirmations}`);
//           console.log(`- Slot: ${status.slot}`);
          
//           if (status.err) {
//               console.log(`- Error: ${JSON.stringify(status.err)}`);
//           } else {
//               console.log('- Error: None');
//           }

//           const statusDetail = status.status;
//           if (statusDetail.Ok !== undefined) {
//               console.log('- Status: Success');
//           } else if (statusDetail.Err !== undefined) {
//               console.log('- Status: Failed');
//               if (statusDetail.Err.InstructionError) {
//                   const [index, error] = statusDetail.Err.InstructionError;
//                   console.log(`- Instruction Error at index ${index}: ${JSON.stringify(error)}`);
//               }
//           }
//       } else {
//           console.log('Transaction not found or status is null');
//       }

//       return status;
//   } catch (error) {
//       console.error('Error fetching transaction status:', error);
//   }
// }

async function getTransactionStatus(transactionSignature, timeout = 28000, interval = 10000) {
  try {
    console.log(`Fetching status for transaction signature: ${transactionSignature}`);
    const startTime = Date.now();
    let status;

    while (Date.now() - startTime < timeout) {
      const statusResponse = await connection.getSignatureStatuses([transactionSignature]);
      status = statusResponse && statusResponse.value[0];

      if (status) {
        console.log('Transaction Status:');
        console.log(`- Confirmation Status: ${status.confirmationStatus}`);
        console.log(`- Confirmations: ${status.confirmations}`);
        console.log(`- Slot: ${status.slot}`);

        if (status.err) {
          console.log(`- Error: ${JSON.stringify(status.err)}`);
        } else {
          console.log('- Error: None');
        }

        const statusDetail = status.status;
        if (statusDetail.Ok !== undefined) {
          console.log('- Status: Success');
        } else if (statusDetail.Err !== undefined) {
          console.log('- Status: Failed');
          if (statusDetail.Err.InstructionError) {
            const [index, error] = statusDetail.Err.InstructionError;
            console.log(`- Instruction Error at index ${index}: ${JSON.stringify(error)}`);
          }
        }

        return status;
      }

      await delay(interval); // Wait for the specified interval before checking again
    }

    throw new Error('Transaction not found or status is null');
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    throw error; // Re-throw the error to propagate it to the caller
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
