import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup } from 'react-bootstrap';
import { todoService } from '../services/todoService';

const Todo = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        try {
            const data = await todoService.getAllTodos();
            setTodos(data);
            setError(null);
        } catch (err) {
            setError('Failed to load todos');
            console.error('Error loading todos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

        try {
            const todoData = {
                title: newTodo,
                completed: false,
            };
            const result = await todoService.createTodo(todoData);
            setTodos([...todos, { ...todoData, _id: result.id }]);
            setNewTodo('');
            setError(null);
        } catch (err) {
            setError('Failed to create todo');
            console.error('Error creating todo:', err);
        }
    };

    const toggleTodo = async (todo) => {
        try {
            await todoService.updateTodo(todo._id, {
                ...todo,
                completed: !todo.completed
            });
            setTodos(todos.map(t => 
                t._id === todo._id 
                    ? { ...t, completed: !t.completed }
                    : t
            ));
            setError(null);
        } catch (err) {
            setError('Failed to update todo');
            console.error('Error updating todo:', err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await todoService.deleteTodo(id);
            setTodos(todos.filter(todo => todo._id !== id));
            setError(null);
        } catch (err) {
            setError('Failed to delete todo');
            console.error('Error deleting todo:', err);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <Container className="py-5">
            <h1 className="mb-4">Todo List</h1>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            <Form onSubmit={handleSubmit} className="mb-4">
                <Form.Group className="d-flex">
                    <Form.Control
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new todo"
                        className="me-2"
                    />
                    <Button type="submit" variant="primary">Add</Button>
                </Form.Group>
            </Form>

            <ListGroup>
                {todos.map(todo => (
                    <ListGroup.Item
                        key={todo._id}
                        className="d-flex justify-content-between align-items-center"
                    >
                        <div className="d-flex align-items-center">
                            <Form.Check
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleTodo(todo)}
                                className="me-3"
                            />
                            <span style={{
                                textDecoration: todo.completed ? 'line-through' : 'none'
                            }}>
                                {todo.title}
                            </span>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteTodo(todo._id)}
                        >
                            Delete
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
};

export default Todo; 