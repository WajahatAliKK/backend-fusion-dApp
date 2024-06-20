import { MongoClient } from 'mongodb';


const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority";
const dbName = 'bird-Api';
const collectionName = 'bird-Api-Collection';

async function connectToMongoDB() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

export async function getRecentData() {
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        // Fetch the top 15 recent documents sorted by timestamp
        const recentData = await collection.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();
        // Use a Set to store unique addresses
        const uniqueAddresses = new Set();
        const uniqueRecentData = [];
        // Iterate over recentData to filter out duplicates by address
        recentData.forEach(doc => {
            const address = doc.address;
            // Check if the address is already in the Set
            if (!uniqueAddresses.has(address)) {
                uniqueAddresses.add(address);
                uniqueRecentData.push(doc);
            }
        });
        return uniqueRecentData;
    } catch (error) {
        console.error('Error fetching recent data:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

export async function getItemsBySource(userChoice) {
    try {
        client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        let query = {};

        if (userChoice === 1) {
            query = { source: "Raydium" };
        } else if (userChoice === 2) {
            query = { source: "Orca" };
        }

        const options = {
            sort: { timestamp: -1 }, 
            limit: 10 
        };

        const items = await collection.find(query).sort(options.sort).limit(options.limit).toArray();
        
        console.log(`Found ${items.length} recent items based on user choice ${userChoice}`);
        
        return items;
    } catch (error) {
        console.error('Error fetching items:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// filter function and enpoint

export async function getItemsByCriteria(criteria) {
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        console.log('Received criteria:', criteria);

        const query = {};

        if (criteria && criteria.liquidity && criteria.liquidity.fromValue != null && criteria.liquidity.toValue != null) {
            query.liquidity = {
                $gte: criteria.liquidity.fromValue, 
                $lte: criteria.liquidity.toValue
            };
        }

        if (criteria && criteria.v24hUSD && criteria.v24hUSD.fromValue != null && criteria.v24hUSD.toValue != null) {
            query.v24hUSD = {
                $gte: criteria.v24hUSD.fromValue, 
                $lte: criteria.v24hUSD.toValue
            };
        }

        if (criteria && criteria.marketCap && criteria.marketCap.fromValue != null && criteria.marketCap.toValue != null) {
            query.marketCap = {
                $gte: criteria.marketCap.fromValue, 
                $lte: criteria.marketCap.toValue
            };
        }

        if (criteria && criteria.trade24h && criteria.trade24h.fromValue != null && criteria.trade24h.toValue != null) {
            query.trade24h = {
                $gte: criteria.trade24h.fromValue, 
                $lte: criteria.trade24h.toValue
            };
        }

        if (criteria && criteria.buy24h && criteria.buy24h.fromValue != null && criteria.buy24h.toValue != null) {
            query.buy24h = {
                $gte: criteria.buy24h.fromValue, 
                $lte: criteria.buy24h.toValue
            };
        }

        if (criteria && criteria.sell24h && criteria.sell24h.fromValue != null && criteria.sell24h.toValue != null) {
            query.sell24h = {
                $gte: criteria.sell24h.fromValue, 
                $lte: criteria.sell24h.toValue
            };
        }

        const items = await collection.find(query).limit(20).toArray();
        console.log(`Found ${items.length} items with the specified criteria`);

        return items;
    } catch (error) {
        console.error('Error fetching items by criteria:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}


export async function updateUserSettings(userAddress, updates) {
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('lumina-birdapi-userSettingData-saved');

        const filter = { userAddress };
        const existingDocument = await collection.findOne(filter);

        if (!existingDocument) {
            throw new Error('User data not found');
        }

        const updateDocument = {};
        if (updates.hasOwnProperty('Slippage')) {
            updateDocument.Slippage = updates.Slippage;
        }
        if (updates.hasOwnProperty('priorityFee')) {
            updateDocument.priorityFee = updates.priorityFee;
        }
        if (updates.hasOwnProperty('smartMevProtection')) {
            updateDocument.smartMevProtection = updates.smartMevProtection;
        }
        if (updates.hasOwnProperty('BriberyAmount')) {
            updateDocument.BriberyAmount = updates.BriberyAmount;
        }
        if (updates.hasOwnProperty('amount1')) {
            updateDocument.amount1 = updates.amount1;
        }
        if (updates.hasOwnProperty('amount2')) {
            updateDocument.amount2 = updates.amount2;
        }
        if (updates.hasOwnProperty('amount3')) {
            updateDocument.amount3 = updates.amount3;
        }
        if (updates.hasOwnProperty('amount4')) {
            updateDocument.amount4 = updates.amount4;
        }
        if (updates.hasOwnProperty('amount5')) {
            updateDocument.amount5 = updates.amount5;
        }
        if (updates.hasOwnProperty('amount6')) {
            updateDocument.amount6 = updates.amount6;
        }

        const result = await collection.updateOne(filter, { $set: updateDocument });

        if (result.modifiedCount === 0) {
            throw new Error('No document found to update');
        }

        console.log(`Updated document for userAddress ${userAddress}`);

        const updatedUserData = await collection.findOne(filter);
        return updatedUserData;
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}


export async function getUserDataByAddress(userAddress) {
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('lumina-birdapi-userSettingData-saved');

        const query = { userAddress };
        console.log('Executing query:', query);
        let userData = await collection.findOne(query);

        console.log('Found user data:', userData);

        if (!userData) {
            const defaultData = {
                userAddress,
                Slippage: 2,
                priorityFee: 0.1,
                smartMevProtection: false,
                BriberyAmount: 0.1,
                amount1: 0.1,
                amount2: 0.2,
                amount3: 0.5,
                amount4: 1,
                amount5: 5,
                amount6: 10
            };

            const result = await collection.insertOne(defaultData);
            userData = { ...defaultData, _id: result.insertedId };

            console.log('Saved new user data:', userData);
        }

        const amounts = [];
        for (let i = 1; i <= 6; i++) {
            const amountKey = `amount${i}`;
            amounts.push({ [amountKey]: userData[amountKey] });
        }

        const transformedUserData = {
            _id: userData._id.toString(),
            userAddress: userData.userAddress,
            Slippage: userData.Slippage ? parseFloat(userData.Slippage) : null,
            priorityFee: userData.priorityFee ? parseFloat(userData.priorityFee) : null,
            smartMevProtection: !!userData.smartMevProtection,
            BriberyAmount: userData.BriberyAmount ? parseFloat(userData.BriberyAmount) : null,
            ...amounts.reduce((acc, cur) => ({ ...acc, ...cur }), {})
        };

        return {
            success: true,
            message: userData ? 'User data found' : 'User data initialized with defaults',
            data: transformedUserData
        };
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}
