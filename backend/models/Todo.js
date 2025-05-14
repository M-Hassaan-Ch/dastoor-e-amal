import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';

export class Todo {
    static async getCollection() {
        const db = await connectToDatabase();
        return db.collection('todos');
    }

    static async findAll(userId) {
        const collection = await this.getCollection();
        return await collection.find({ 
            userId: new ObjectId(userId),
            isListMarker: { $ne: true } // Exclude list marker documents
        }).toArray();
    }

    static async findById(id) {
        const collection = await this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    static async create(todoData) {
        const collection = await this.getCollection();
        const todoDoc = {
            title: todoData.title,
            completed: todoData.completed || false,
            userId: new ObjectId(todoData.userId),
            listId: todoData.listId,
            listName: todoData.listName,
            description: todoData.description || '',
            dueDate: todoData.dueDate || null,
            tags: todoData.tags || [],
            isListMarker: todoData.isListMarker || false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(todoDoc);
        return result.insertedId;
    }

    static async update(id, todoData) {
        const collection = await this.getCollection();
        const updateDoc = {
            ...todoData,
            updatedAt: new Date()
        };
        
        // Remove _id if it exists to avoid MongoDB error
        delete updateDoc._id;
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateDoc }
        );
        return result.modifiedCount > 0;
    }

    static async delete(id) {
        const collection = await this.getCollection();
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
} 