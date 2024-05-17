import { MongoClient } from 'mongodb';

const dbName = 'cluster1';
const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}

async function insertOne(collectionName, data) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(data);
        await client.close();
        return result;
    } catch (error) {
        throw new Error('Error inserting data into MongoDB: ' + error.message);
    }
}

async function findOne(collectionName, query) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.findOne(query);
        await client.close();
        return result;
    } catch (error) {
        throw new Error('Error querying data from MongoDB: ' + error.message);
    }
}

async function updateOne(collectionName, filter, update) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(filter, update);
        await client.close();
        return result;
    } catch (error) {
        throw new Error('Error updating data in MongoDB: ' + error.message);
    }
}

async function findAll(collectionName) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.find({}).toArray();
        await client.close();
        return result;
    } catch (error) {
        throw new Error('Error querying data from MongoDB: ' + error.message);
    }
}

export {
    insertOne,
    findOne,
    updateOne,
    findAll
};
