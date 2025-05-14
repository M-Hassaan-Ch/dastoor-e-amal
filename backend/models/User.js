import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/db.js';
import bcrypt from 'bcryptjs';

export class User {
    static async getCollection() {
        const db = await connectToDatabase();
        return db.collection('users');
    }

    static async findByEmail(email) {
        const collection = await this.getCollection();
        return await collection.findOne({ email });
    }

    static async create(userData) {
        const collection = await this.getCollection();
        
        // Check if user already exists
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        const result = await collection.insertOne({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return result.insertedId;
    }

    static async validatePassword(user, password) {
        return await bcrypt.compare(password, user.password);
    }
} 