import express from 'express';
import { Todo } from '../models/Todo.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get all todos
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.findAll(req.userId);
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single todo
router.get('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        if (todo.userId !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new todo
router.post('/', async (req, res) => {
    try {
        const todoId = await Todo.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json({ id: todoId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a todo
router.put('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        if (todo.userId !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const success = await Todo.update(req.params.id, req.body);
        if (!success) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        if (todo.userId !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const success = await Todo.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 