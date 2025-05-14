import { MongoClient } from 'mongodb';

// Local MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app';

let client;

export async function connectToDatabase() {
    try {
        if (!client) {
            client = new MongoClient(MONGODB_URI);
            await client.connect();
            console.log('Connected to MongoDB successfully');
        }
        return client.db();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

export async function closeDatabaseConnection() {
    if (client) {
        await client.close();
        client = null;
        console.log('MongoDB connection closed');
    }
} 