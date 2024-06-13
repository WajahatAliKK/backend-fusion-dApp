const { MongoClient } = require('mongodb');


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

        const recentData = await collection.find().sort({ timestamp: -1 }).limit(15).toArray();

        return recentData;
    } catch (error) {
        console.error('Error fetching recent data:', error);
        throw error;
    } finally {
        if (client) {
            await client.close();
        }
    }
}