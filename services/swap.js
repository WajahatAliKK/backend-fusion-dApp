
import { VersionedTransaction, Connection, Keypair, Transaction, TransactionInstruction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import { Wallet } from '@project-serum/anchor';
import bs58 from 'bs58';
import axios from 'axios';
import { config } from 'dotenv';

import * as solanaWeb3 from '@solana/web3.js';
config();
import { MongoClient } from 'mongodb';
// const { searcherClient } = require('./sdk/block-engine/searcher.js');
// const { Bundle } = require('./sdk/block-engine/types.js');
import crypto from 'crypto';
// const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/kgYyEi-DvcfTHEiTGeO7LGbPEJ5lofWm');
const connection = new Connection('https://ultra-delicate-lambo.solana-mainnet.quiknode.pro/9e6a18285b47f9974b7cac73e999be568cfe9929/');
// const secretKey = new Uint8Array([221, 238, 170, 48, 10, 197, 218, 88, 141, 249, 123, 237, 213, 238, 81, 101, 155, 167, 236, 128, 150, 124, 36, 30, 41, 232, 115, 237, 34, 229, 218, 126, 36, 33, 20, 135, 210, 180, 37, 39, 188, 204, 79, 45, 101, 118, 158, 210, 203, 3, 110, 200, 190, 177, 110, 203, 64, 51, 222, 90, 235, 47, 98, 198]);
// const keypair = Keypair.fromSecretKey(secretKey);
// const jito_url = 'mainnet.block-engine.jito.wtf';
// // const jito_client = searcherClient(jito_url, keypair);

const dbName = 'cluster1';
const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
  const client = new MongoClient(url);
  await client.connect();
  return client;
}

// const wallet = new Wallet(Keypair.fromSecretKey(bs58.decode(privateKey)));

async function getSwapQuote(inputMint, outputMint, amount, swapMode) {
  try {
    const quoteResponse = await axios.get(`https://quote-api.jup.ag/v6/quote`, {
      params: {
        inputMint,
        outputMint,
        amount,
        swapMode: swapMode

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

export async function swapInstructions(inputMint, outputMint, amount) {
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


export async function swapTokens(inputMint, outputMint, amount, swapMode, address, slippageBps) {
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
    console.log(typeof (uint8Array))

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
    let txid = transaction.signatures[0];
    txid = bs58.encode(tx_signature);

    const bundle = new Bundle([transaction], 5); // Adjust the transaction limit as needed
    // Add a tip transaction (optional)
    const tipLamports = 50000; // Amount in lamports for the tip
    const tipAccount = '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'; // Ensure tipAccount is a valid PublicKey
    bundle.addTipTx(keypair, tipLamports, new PublicKey(tipAccount), recentBlockhash);

    const bundleId = jito_client.sendBundle(bundle);
    console.log('Bundle submitted. Transaction ID:', bundleId);
    const transactionResult = `https://solscan.io/tx/${txid}`;
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

// function tot TannsfeSOL
export async function transferSOL(fromPublicKey, toPublicKey, amount) {
    try {
        // const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
        

        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');
        const walletData = await collection.findOne({ publicKey: fromPublicKey });
        await client.close();

        if (!walletData) {
            throw new Error('Wallet data not found for address: ' + fromPublicKey);
        }

        const encryptionKey = process.env.ENCRYPTION_KEY;
        const { encryptedPrivateKey: { encryptedPrivateKey, iv } } = walletData;
        const decryptedPrivateKey = await decryptPrivateKey(encryptedPrivateKey, iv, encryptionKey);
        const privateKeyArray = decryptedPrivateKey.split(',').map(Number);
        const privateKeyUint8Array = new Uint8Array(privateKeyArray);

  
        const fromKeypair = solanaWeb3.Keypair.fromSecretKey(privateKeyUint8Array);


        const senderBalance = await connection.getBalance(fromKeypair.publicKey);
        console.log(`Sender's balance: ${senderBalance / solanaWeb3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Sender's Address: ${fromKeypair.publicKey.toString()}`);

        const toPubKey = new solanaWeb3.PublicKey(toPublicKey);
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPubKey,
                lamports: amount,
            })
        );
        const latestBlockhash = await connection.getLatestBlockhash();
        // Set the recent blockhash to the transaction
        transaction.recentBlockhash = latestBlockhash.blockhash;

        // Step 6: Sign the Transaction
        transaction.sign(fromKeypair);
        // const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
        // const signature = await connection.sendRawTransaction.send(connection, transaction, [fromKeypair]);
        const rawTransaction = transaction.serialize();
        
        // transaction.recentBlockhash = latestBlockhash
        const txid = await connection.sendRawTransaction(rawTransaction);

       const transactionResult =  `https://solscan.io/tx/${txid}`;
        return transactionResult;
    } catch (error) {
        console.error("An error occurred while transferring SOL:", error);
        throw error;
    }
}

export async function withdraw(fromPublicKey, toPublicKey, amountInLamports) {
  const getUserBalance = await getBalance(fromPublicKey);
  console.log("User Balance:", getUserBalance);
  const fee = 5000;
  const remainingBalance = getUserBalance - amountInLamports;
  let transactionAmount;
  if (remainingBalance >= fee) {
      transactionAmount = amountInLamports;
  } else {
      transactionAmount = amountInLamports - fee;
  }
  try {
      const signature = await transferSOL(fromPublicKey, toPublicKey, transactionAmount);
      console.log("Transaction amount :" ,transactionAmount);
      console.log("Transaction signature:", signature);
      return signature;
  } catch (error) {
      console.error("Withdrawal failed:", error);
      throw error;
  }
}
