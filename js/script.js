// DOM Elements
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const dateInput = document.getElementById('dateInput');
const todoList = document.getElementById('todoList');
const filterDate = document.getElementById('filterDate');
const clearFilter = document.getElementById('clearFilter');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const stats = document.getElementById('stats');

// Load todos from localStorage on page load
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let editingId = null; // Track if editing a specific todo
let currentFilter = ''; // For search
let currentSort = 'date-asc'; // Default sort

// Initial setup
updateFilterOptions(todos);
updateStats(todos);
applyFiltersAndSort(); // Fixed: Use applyFiltersAndSort for initial display with sort

// Form Submission - Add Todo (only for adding new, not editing)
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validation
    const todoText = todoInput.value.trim();
    const selectedDate = dateInput.value;
    
    if (!todoText) {
        alert('Please enter a to-do item!');
        return;
    }
    
    if (!selectedDate) {
        alert('Please select a date!');
        return;
    }
    
    // Create new todo object (no editing logic here - edit is inline)
    const newTodo = {
        id: Date.now(),
        text: todoText,
        date: selectedDate,
        completed: false
    };
    
    // Add to array
    todos.push(newTodo);
    todoForm.reset();
    
    // Save and update
    localStorage.setItem('todos', JSON.stringify(todos));
    updateFilterOptions(todos);
    updateStats(todos);
    applyFiltersAndSort(); // Fixed: Apply filters/sort after add
});

// Event Delegation for List Actions (Delete, Edit, Save, Cancel, Checkbox)
todoList.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    const todoIndex = todos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) return;
    
    if (e.target.classList.contains('delete-btn')) {
        // Fade-out animation
        const li = e.target.closest('.todo-item');
        li.classList.add('fade-out');
        setTimeout(() => {
            todos.splice(todoIndex, 1); // Fixed: Use splice for correct index
            localStorage.setItem('todos', JSON.stringify(todos));
            updateFilterOptions(todos);
            updateStats(todos);
            applyFiltersAndSort();
        }, 300);
    } else if (e.target.classList.contains('edit-btn')) {
        editingId = id; // Enter edit mode by setting ID
        applyFiltersAndSort(); // Refresh display to show inline edit
        // Focus the input after render
        setTimeout(() => {
            const editInput = document.getElementById(`editText-${id}`);
            if (editInput) editInput.focus();
        }, 100);
    } else if (e.target.classList.contains('save-btn')) {
        saveEdit(id, todoIndex);
    } else if (e.target.classList.contains('cancel-btn')) {
        cancelEdit();
    } else if (e.target.classList.contains('todo-checkbox')) {
        todos[todoIndex].completed = e.target.checked;
        localStorage.setItem('todos', JSON.stringify(todos));
        updateStats(todos);
        applyFiltersAndSort(); // Refresh to update visual
    }
});

// Save Edit (Inline - get values from inline inputs)
function saveEdit(id, index) {
    const editTextInput = document.getElementById(`editText-${id}`);
    const editDateInput = document.getElementById(`editDate-${id}`);
    
    if (!editTextInput || !editDateInput) return;
    
    const newText = editTextInput.value.trim();
    const newDate = editDateInput.value;
    
    // Validation for edit
    if (!newText) {
        alert('To-do item cannot be empty!');
        return;
    }
    if (!newDate) {
        alert('Date cannot be empty!');
        return;
    }
    
    // Update todo
    todos[index].text = newText;
    todos[index].date = newDate;
    
    // Reset edit mode
    editingId = null;
    
    localStorage.setItem('todos', JSON.stringify(todos));
    updateFilterOptions(todos);
    updateStats(todos);
    applyFiltersAndSort(); // Refresh display
}

// Cancel Edit
function cancelEdit() {
    editingId = null;
    applyFiltersAndSort(); // Refresh to normal mode
}

// Search Filter (Real-time)
searchInput.addEventListener('input', (e) => {
    currentFilter = e.target.value.toLowerCase();
    applyFiltersAndSort();
});

// Sort Change
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    applyFiltersAndSort();
});

// Date Filter
filterDate.addEventListener('change', () => {
    applyFiltersAndSort();
});

clearFilter.addEventListener('click', () => {
    filterDate.value = '';
    searchInput.value = '';
    currentFilter = '';
    applyFiltersAndSort();
});

// Apply Filters, Search, and Sort (Fixed: Filter first, then sort the result for display)
function applyFiltersAndSort() {
    let filteredTodos = todos.filter(todo => {
        const matchesDate = !filterDate.value || todo.date === filterDate.value;
        const matchesSearch = !currentFilter || todo.text.toLowerCase().includes(currentFilter);
        return matchesDate && matchesSearch;
    });
    
    // Fixed: Sort the filtered results, don't mutate global todos
    const sortedFiltered = sortTodos(filteredTodos, currentSort);
    displayTodos(sortedFiltered);
}

// Sort Function
function sortTodos(todosToSort, sortType) {
    return [...todosToSort].sort((a, b) => {
        if (sortType === 'date-asc') {
            return new Date(a.date) - new Date(b.date);
        } else if (sortType === 'alpha-asc') {
            return a.text.localeCompare(b.text);
        }
        return 0;
    });
}

// Function to display todos (Complete and Fixed: Full HTML, checkbox, edit mode, fade-in)
function displayTodos(todosToShow) {
    todoList.innerHTML = '';
    todosToShow.forEach(todo => {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        if (todo.completed) li.classList.add('completed');
        li.dataset.todoId = todo.id;
        
        let htmlContent;
        if (editingId === todo.id) {
            // Edit mode: Inline inputs (no checkbox during edit)
            htmlContent = `
                <input type="text" class="edit-input" value="${todo.text}" id="editText-${todo.id}">
                <input type="date" class="edit-date-input" value="${todo.date}" id="editDate-${todo.id}">
                <button class="save-btn" data-id="${todo.id}">Save</button>
                <button class="cancel-btn" data-id="${todo.id}">Cancel</button>
            `;
            li.classList.add('edit-mode');
        } else {
            // Normal mode: With checkbox
            htmlContent = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-date">Due: ${new Date(todo.date).toLocaleDateString()}</span>
                <button class="edit-btn" data-id="${todo.id}">Edit</button>
                <button class="delete-btn" data-id="${todo.id}">Delete</button>
            `;
        }
        
        li.innerHTML = htmlContent;
        todoList.appendChild(li);
        
        // Fade-in animation (Fixed: Trigger after append)
        li.style.opacity = '0';
        li.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            li.style.opacity = '1';
        }, 10);
    });
}

// Function to update filter dropdown with unique dates (Sorted)
function updateFilterOptions(allTodos) {
    const uniqueDates = [...new Set(allTodos.map(todo => todo.date))].sort();
    filterDate.innerHTML = '<option value="">All Dates</option>';
    uniqueDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = new Date(date).toLocaleDateString();
        filterDate.appendChild(option);
    });
}

// Function to update stats (Fixed: Always on full todos)
function updateStats(allTodos) {
    const total = allTodos.length;
    const completedCount = allTodos.filter(todo => todo.completed).length;
    const pending = total - completedCount;
    stats.innerHTML = `Total: ${total} | Completed: ${completedCount} | Pending: ${pending}`;
}
