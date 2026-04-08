let todos = [
    { id: 1, title: "Estudar Laravel", description: "", completed: false },
    { id: 2, title: "Estudar Express", description: "", completed: true },
    { id: 3, title: "Estudar FastAPI", description: "", completed: false }
];

export function getTodos() {
    return Promise.resolve(todos);
}

export function createTodo(data) {
    const newTodo = {
        id: Date.now(),
        ...data,
        completed: false
    };

    todos.push(newTodo);
    return Promise.resolve(newTodo);
}

export function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    todo.completed = !todo.completed;
    return Promise.resolve(todo);
}

export function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    return Promise.resolve();
}

export function getStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    return Promise.resolve({ total, completed });
}