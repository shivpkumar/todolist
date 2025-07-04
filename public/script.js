class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadTodos();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.totalTodos = document.getElementById('totalTodos');
        this.completedTodos = document.getElementById('completedTodos');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Add todo events
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
    }

    async loadTodos() {
        try {
            const response = await fetch('/api/todos');
            if (response.ok) {
                this.todos = await response.json();
                this.renderTodos();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error loading todos:', error);
            this.showError('Failed to load todos');
        }
    }

    async addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (response.ok) {
                const newTodo = await response.json();
                this.todos.unshift(newTodo);
                this.todoInput.value = '';
                this.renderTodos();
                this.updateStats();
                
                // Add animation class to new todo
                setTimeout(() => {
                    const newTodoElement = document.querySelector(`[data-id="${newTodo.id}"]`);
                    if (newTodoElement) {
                        newTodoElement.classList.add('new');
                        setTimeout(() => newTodoElement.classList.remove('new'), 300);
                    }
                }, 10);
            } else {
                throw new Error('Failed to add todo');
            }
        } catch (error) {
            console.error('Error adding todo:', error);
            this.showError('Failed to add todo');
        }
    }

    async toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !todo.completed }),
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                const index = this.todos.findIndex(t => t.id === id);
                this.todos[index] = updatedTodo;
                this.renderTodos();
                this.updateStats();
            } else {
                throw new Error('Failed to update todo');
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
            this.showError('Failed to update todo');
        }
    }

    async deleteTodo(id) {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.renderTodos();
                this.updateStats();
            } else {
                throw new Error('Failed to delete todo');
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
            this.showError('Failed to delete todo');
        }
    }

    async updateTodoText(id, newText) {
        if (!newText.trim()) {
            this.cancelEdit();
            return;
        }

        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: newText.trim() }),
            });

            if (response.ok) {
                const updatedTodo = await response.json();
                const index = this.todos.findIndex(t => t.id === id);
                this.todos[index] = updatedTodo;
                this.editingId = null;
                this.renderTodos();
            } else {
                throw new Error('Failed to update todo');
            }
        } catch (error) {
            console.error('Error updating todo:', error);
            this.showError('Failed to update todo');
            this.cancelEdit();
        }
    }

    async clearCompletedTodos() {
        const completedTodoIds = this.todos
            .filter(todo => todo.completed)
            .map(todo => todo.id);

        if (completedTodoIds.length === 0) return;

        try {
            const deletePromises = completedTodoIds.map(id =>
                fetch(`/api/todos/${id}`, { method: 'DELETE' })
            );

            await Promise.all(deletePromises);
            this.todos = this.todos.filter(todo => !todo.completed);
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            console.error('Error clearing completed todos:', error);
            this.showError('Failed to clear completed todos');
        }
    }

    startEdit(id) {
        this.editingId = id;
        this.renderTodos();
        
        // Focus the edit input
        const editInput = document.querySelector('.edit-input');
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }

    cancelEdit() {
        this.editingId = null;
        this.renderTodos();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTodos();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.emptyState.style.display = 'block';
        } else {
            this.emptyState.style.display = 'none';
            
            filteredTodos.forEach(todo => {
                const todoElement = this.createTodoElement(todo);
                this.todoList.appendChild(todoElement);
            });
        }
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        if (this.editingId === todo.id) {
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
                <input type="text" class="edit-input" value="${this.escapeHtml(todo.text)}">
                <div class="todo-actions">
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            `;

            // Bind edit events
            const editInput = li.querySelector('.edit-input');
            const saveBtn = li.querySelector('.save-btn');
            const cancelBtn = li.querySelector('.cancel-btn');

            const saveEdit = () => {
                this.updateTodoText(todo.id, editInput.value);
            };

            const cancelEdit = () => {
                this.cancelEdit();
            };

            saveBtn.addEventListener('click', saveEdit);
            cancelBtn.addEventListener('click', cancelEdit);
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') saveEdit();
                if (e.key === 'Escape') cancelEdit();
            });
        } else {
            li.innerHTML = `
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}"></div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div class="todo-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            // Bind events
            const checkbox = li.querySelector('.todo-checkbox');
            const editBtn = li.querySelector('.edit-btn');
            const deleteBtn = li.querySelector('.delete-btn');

            checkbox.addEventListener('click', () => this.toggleTodo(todo.id));
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.startEdit(todo.id);
            });
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this todo?')) {
                    this.deleteTodo(todo.id);
                }
            });
        }

        return li;
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        
        this.totalTodos.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;
        this.completedTodos.textContent = `${completed} completed`;
        
        // Enable/disable clear completed button
        this.clearCompleted.disabled = completed === 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        // Simple error display - in a real app, you might want a more sophisticated notification system
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});