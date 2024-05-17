import { MongoClient } from 'mongodb';

const dbName = 'cluster1';
const url = "mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function connectToMongoDB() {
    const client = new MongoClient(url);
    await client.connect();
    return client;
}

async function settingApprove(publicAddress, autoApprove, maxGasLimit, priorityFee) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('Approve');

        const existingData = await collection.findOne({ publicAddress });

        if (existingData) {
            const result = await collection.updateOne(
                { publicAddress },
                { $set: { autoApprove, maxGasLimit, priorityFee } }
            );
            await client.close();
            return 'Settings updated';
        } else {
            const result = await collection.insertOne({
                publicAddress,
                autoApprove,
                maxGasLimit,
                priorityFee
            });
            await client.close();
            return 'Settings saved';
        }
    } catch (error) {
        throw new Error('Error saving approve settings: ' + error.message);
    }
}

async function getSettingApprove(publicAddress) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('Approve');

        const result = await collection.findOne({ publicAddress });

        await client.close();

        if (result) {
            return result;
        } else {
            throw new Error('Settings not found for the provided public address');
        }
    } catch (error) {
        throw new Error('Error retrieving approve settings: ' + error.message);
    }
}

async function setQuickBuySettings(publicAddress, slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');

        const existingData = await collection.findOne({ publicAddress });

        if (existingData) {
            const result = await collection.updateOne(
                { publicAddress },
                { $set: { slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts } }
            );
            await client.close();
            return 'Settings updated';
        } else {
            const result = await collection.insertOne({
                publicAddress,
                slipPage,
                maxGasLimit,
                priorityFee,
                mevProtection,
                briberyAmount,
                customizedAmounts
            });
            await client.close();
            return 'Settings saved';
        }
    } catch (error) {
        throw new Error('Error saving quickbuy settings: ' + error.message);
    }
}

async function setQuickSellSettings(publicAddress, slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');

        const existingData = await collection.findOne({ publicAddress });

        if (existingData) {
            const result = await collection.updateOne(
                { publicAddress },
                { $set: { slipPage, maxGasLimit, priorityFee, mevProtection, briberyAmount, customizedAmounts } }
            );
            await client.close();
            return 'Settings updated';
        } else {
            const result = await collection.insertOne({
                publicAddress,
                slipPage,
                maxGasLimit,
                priorityFee,
                mevProtection,
                briberyAmount,
                customizedAmounts
            });
            await client.close();
            return 'Settings saved';
        }
    } catch (error) {
        throw new Error('Error saving quickSell settings: ' + error.message);
    }
}

async function getQuickBuySettings(publicAddress) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');
        
        const result = await collection.findOne({ publicAddress });

        await client.close();

        if (result) {
            return result;
        } else {
            throw new Error('Settings not found for the provided public address');
        }
    } catch (error) {
        throw new Error('Error retrieving quickbuy settings: ' + error.message);
    }
}

async function getQuickSellSettings(publicAddress) {
    try {
        const client = await connectToMongoDB();
        const db = client.db(dbName);
        const collection = db.collection('newcollection');
        
        const result = await collection.findOne({ publicAddress });
   
        await client.close();

        if (result) {
            return result;
        } else {
            throw new Error('Settings not found for the provided public address');
        }
    } catch (error) {
        throw new Error('Error retrieving quickSell settings: ' + error.message);
    }
}

export {
    settingApprove,
    getSettingApprove,
    setQuickBuySettings,
    setQuickSellSettings,
    getQuickBuySettings,
    getQuickSellSettings
};
