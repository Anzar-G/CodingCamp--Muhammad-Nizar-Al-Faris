// Mengambil referensi elemen-elemen dari DOM
const todoInput = document.getElementById('todo-input');
const dateInput = document.getElementById('date-input');
const addButton = document.getElementById('add-button');
const todoTableBody = document.getElementById('todo-table-body');
const deleteAllButton = document.getElementById('delete-all-button');
const filterButton = document.getElementById('filter-button');
const noTaskFound = document.getElementById('no-task-found');

// Array untuk menyimpan daftar tugas, diambil dari localStorage jika ada
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let isFiltered = false;

// Fungsi untuk menyimpan data ke localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Fungsi untuk menampilkan tugas ke UI
function renderTodos() {
    // Kosongkan tabel sebelum merender ulang
    todoTableBody.innerHTML = '';

    // Tampilkan pesan jika tidak ada tugas
    if (todos.length === 0) {
        noTaskFound.style.display = 'block';
    } else {
        noTaskFound.style.display = 'none';
    }

    // Tentukan data yang akan ditampilkan (terfilter atau tidak)
    const todosToRender = isFiltered ? todos.filter(todo => !todo.completed) : todos;

    if (todosToRender.length === 0 && isFiltered) {
        noTaskFound.textContent = 'Tidak ada tugas yang belum selesai.';
        noTaskFound.style.display = 'block';
    } else if (todosToRender.length === 0 && !isFiltered) {
        noTaskFound.textContent = 'Belum ada tugas.';
        noTaskFound.style.display = 'block';
    } else {
        todosToRender.forEach((todo, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${todo.task}</td>
                <td>${todo.dueDate}</td>
                <td class="status-cell ${todo.completed ? 'status-completed' : 'status-pending'}">
                    ${todo.completed ? 'Selesai' : 'Pending'}
                </td>
                <td class="actions-cell">
                    <button class="done-button" data-index="${index}" ${todo.completed ? 'disabled' : ''}>Selesai</button>
                    <button class="delete-button" data-index="${index}">Hapus</button>
                </td>
            `;
            todoTableBody.appendChild(row);
        });
    }
}

// Menambahkan event listener untuk tombol 'Tambah'
addButton.addEventListener('click', (e) => {
    e.preventDefault(); // Mencegah form submit default

    const task = todoInput.value.trim();
    const date = dateInput.value;

    // Validasi input
    if (task === '') {
        alert('Tugas tidak boleh kosong!');
        return;
    }

    const newTodo = {
        task: task,
        dueDate: date || 'Tidak Ada Batas Waktu',
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();

    // Reset input
    todoInput.value = '';
    dateInput.value = '';
});

// Menambahkan event listener untuk tombol 'Hapus Semua'
deleteAllButton.addEventListener('click', () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua tugas?')) {
        todos = [];
        saveTodos();
        renderTodos();
    }
});

// Menambahkan event listener untuk tombol 'Filter'
filterButton.addEventListener('click', () => {
    isFiltered = !isFiltered;
    filterButton.textContent = isFiltered ? 'Tampilkan Semua' : 'Filter';
    renderTodos();
});

// Menambahkan event listener ke tabel untuk menangani tombol 'Selesai' dan 'Hapus'
todoTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('done-button')) {
        const index = e.target.dataset.index;
        todos[index].completed = true;
        saveTodos();
        renderTodos();
    }

    if (e.target.classList.contains('delete-button')) {
        const index = e.target.dataset.index;
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        }
    }
});

// Render tugas saat halaman pertama kali dimuat
renderTodos();