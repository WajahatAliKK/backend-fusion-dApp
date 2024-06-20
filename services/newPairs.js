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
