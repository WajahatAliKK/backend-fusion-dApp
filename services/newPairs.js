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
