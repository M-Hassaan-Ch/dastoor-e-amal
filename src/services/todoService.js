const LOCAL_STORAGE_KEY = "todo_items";

const getTodosFromStorage = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveTodosToStorage = (todos) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
};

export const todoService = {
  async getAllTodos() {
    return getTodosFromStorage();
  },

  async getTodoById(id) {
    const todos = getTodosFromStorage();
    const todo = todos.find((t) => t._id === id);
    if (!todo) throw new Error("Todo not found");
    return todo;
  },

  async createTodo(todoData) {
    const todos = getTodosFromStorage();
    const newTodo = {
      ...todoData,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    todos.push(newTodo);
    saveTodosToStorage(todos);
    return newTodo;
  },

  async updateTodo(id, todoData) {
    const todos = getTodosFromStorage();
    const index = todos.findIndex((t) => t._id === id);
    if (index === -1) throw new Error("Todo not found");

    todos[index] = {
      ...todos[index],
      ...todoData,
      updatedAt: new Date().toISOString(),
    };
    saveTodosToStorage(todos);
    return todos[index];
  },

  async deleteTodo(id) {
    let todos = getTodosFromStorage();
    todos = todos.filter((t) => t._id !== id);
    saveTodosToStorage(todos);
    return { message: "Todo deleted successfully" };
  },
};
