const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
    }
    return data;
};

export const todoService = {
    async getAllTodos() {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async getTodoById(id) {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },

    async createTodo(todoData) {
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(todoData),
        });
        return handleResponse(response);
    },

    async updateTodo(id, todoData) {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(todoData),
        });
        return handleResponse(response);
    },

    async deleteTodo(id) {
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(response);
    },
}; 