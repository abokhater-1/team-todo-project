document.addEventListener('DOMContentLoaded', async () => {
  const table = document.querySelector('.task-table');
  const popup = document.querySelector('.add-task-popup');
  const editPopup = document.querySelector('.edit-task-popup');
  const addBtn = document.querySelector('.add-task-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const addForm = document.getElementById('add-task-form');
  const editForm = document.getElementById('edit-task-form');

  const selectAdd = document.getElementById('assignedToSelect');
  const selectEdit = document.getElementById('editAssignedToSelect');

  async function loadEmployees() {
    try {
      const res = await fetch('/api/employees');
      const employees = await res.json();

      selectAdd.innerHTML = '<option value="">Select employee</option>';
      selectEdit.innerHTML = '<option value="">Select employee</option>';

      employees.forEach(emp => {
        const optionAdd = document.createElement('option');
        optionAdd.value = emp.name;
        optionAdd.textContent = `${emp.name} (${emp.email})`;
        selectAdd.appendChild(optionAdd);

        const optionEdit = document.createElement('option');
        optionEdit.value = emp.name;
        optionEdit.textContent = `${emp.name} (${emp.email})`;
        selectEdit.appendChild(optionEdit);
      });
    } catch (err) {
      console.error('❌ Failed to load employees:', err);
    }
  }

  async function loadTasks() {
    try {
      const response = await fetch('/api/tasks');
      const tasks = await response.json();
      document.querySelectorAll('.task-row').forEach(row => row.remove());

      tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';
        row.setAttribute('data-id', task._id);

        row.innerHTML = `
          <span>${task.title}</span>
          <span>${task.description}</span>
          <span>${task.assignedTo}</span>
          <span>${task.status}</span>
          <button class="icon-btn edit-btn" title="Edit Task">✏️</button>
          <button class="icon-btn delete-btn" title="Delete Task">🗑️</button>
          <button class="icon-btn status-btn" title="Change Status">🔁</button>
          <button class="icon-btn comment-btn" title="Comment">💬</button>
        `;

        table.appendChild(row);
      });
    } catch (err) {
      console.error('❌ Error loading tasks:', err);
    }
  }

  await loadEmployees();
  await loadTasks();

  addBtn.addEventListener('click', () => {
    popup.style.display = 'block';
  });

  cancelBtn.addEventListener('click', () => popup.style.display = 'none');
  cancelEditBtn.addEventListener('click', () => editPopup.style.display = 'none');

  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newTask = {
      title: addForm.title.value,
      description: addForm.description.value,
      assignedTo: selectAdd.value,
      status: addForm.status.value
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (res.ok) {
        alert('✅ Task added!');
        location.reload();
      } else {
        const errorData = await res.json();
        alert('❌ Failed to add task: ' + errorData.error);
      }
    } catch (err) {
      console.error('❌ Error adding task:', err);
    }
  });

  table.addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const row = e.target.closest('.task-row');
      const id = row.dataset.id;
      const [title, description, assignedTo, status] = Array.from(row.querySelectorAll('span')).map(s => s.textContent);

      editForm.id.value = id;
      editForm.title.value = title;
      editForm.description.value = description;
      editForm.status.value = status;

      for (let option of selectEdit.options) {
        option.selected = option.value === assignedTo;
      }

      editPopup.style.display = 'block';
    }
  });

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = editForm.id.value;
    const updatedTask = {
      title: editForm.title.value,
      description: editForm.description.value,
      assignedTo: selectEdit.value,
      status: editForm.status.value
    };

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });

      if (res.ok) {
        alert('✅ Task updated!');
        editPopup.style.display = 'none';
        await loadTasks();
      } else {
        const errorData = await res.json();
        alert('❌ Failed to update task: ' + (errorData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Error updating task:', err);
    }
  });

  table.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const row = e.target.closest('.task-row');
      const id = row.dataset.id;
      if (confirm("Are you sure you want to delete this task?")) {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        await loadTasks();
      }
    }
  });

  const statusPopup = document.querySelector('.status-popup');
  const statusForm = document.getElementById('status-form');
  const statusSelect = document.getElementById('status-select');
  const cancelStatusBtn = document.getElementById('cancel-status-btn');
  let currentTaskId = null;

  table.addEventListener('click', (e) => {
    if (e.target.classList.contains('status-btn')) {
      const row = e.target.closest('.task-row');
      currentTaskId = row.dataset.id;
      statusPopup.style.display = 'block';
    }
  });

  cancelStatusBtn.addEventListener('click', () => {
    statusPopup.style.display = 'none';
    currentTaskId = null;
  });

  statusForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentTaskId) return;
    const selectedStatus = statusSelect.value;

    try {
      await fetch(`/api/tasks/${currentTaskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus })
      });
      statusPopup.style.display = 'none';
      currentTaskId = null;
      await loadTasks();
    } catch (err) {
      console.error('❌ Failed to update status:', err);
    }
  });

  const commentPopup = document.querySelector('.comment-popup');
  const submitCommentBtn = document.getElementById('submit-comment-btn');
  const cancelCommentBtn = document.getElementById('cancel-comment-btn');
  const commentTextarea = document.getElementById('new-comment');
  const recentCommentsDiv = document.getElementById('recent-comments');

  table.addEventListener('click', async (e) => {
    if (e.target.classList.contains('comment-btn')) {
      const row = e.target.closest('.task-row');
      currentTaskId = row.dataset.id;
      commentTextarea.value = '';
      commentPopup.style.display = 'block';
      await loadComments();
    }
  });

  cancelCommentBtn.addEventListener('click', () => {
    commentPopup.style.display = 'none';
    currentTaskId = null;
  });

  submitCommentBtn.addEventListener('click', async () => {
    if (!currentTaskId) return;
    const text = commentTextarea.value.trim();
    if (!text) return;

    await fetch(`/api/tasks/${currentTaskId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    commentTextarea.value = '';
    await loadComments();
  });

  async function loadComments() {
    const res = await fetch(`/api/tasks/${currentTaskId}`);
    const task = await res.json();
    if (task && task.comments.length > 0) {
      recentCommentsDiv.innerHTML = '<strong>Recent Comments:</strong><br>' + task.comments.map(c => `• ${c}`).join('<br>');
    } else {
      recentCommentsDiv.innerHTML = '<strong>No comments yet.</strong>';
    }
  }

  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          window.location.href = '/login.html';
        }
      } catch (err) {
        console.error('❌ Logout failed:', err);
      }
    });
  }
});

async function fetchQuote() {
  try {
    const res = await fetch('https://api.quotable.io/random');
    const data = await res.json();
    document.getElementById('quote-text').textContent = `"${data.content}" — ${data.author}`;
  } catch (err) {
    console.error('Failed to fetch quote:', err);
    document.getElementById('quote-text').textContent = 'Could not load quote.';
  }
}

// Run once when page loads
fetchQuote();

// Refresh quote every 15 minutes (900,000 ms)
setInterval(fetchQuote, 900000);

// Manual refresh on button click
document.getElementById('change-quote-btn').addEventListener('click', fetchQuote);

async function loadQuote() {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    const quote = data[0].q;
    const author = data[0].a;
    document.querySelector(".quote-box p").innerHTML = `"${quote}"`;
    document.querySelector(".quote-box small").innerHTML = `— ${author}`;
  } catch (err) {
    document.querySelector(".quote-box p").textContent = "Could not load quote.";
  }
}

// Call it when page loads
document.addEventListener("DOMContentLoaded", loadQuote);

// 🔁 Quote functionality for manager and employee dashboards
document.addEventListener("DOMContentLoaded", () => {
  const quoteText = document.querySelector(".quote-box p");
  const quoteAuthor = document.querySelector(".quote-box small");
  const quoteButton = document.getElementById("change-quote-btn");

  async function loadQuote() {
    try {
      const res = await fetch("https://zenquotes.io/api/random");
      const data = await res.json();
      quoteText.textContent = `"${data[0].q}"`;
      quoteAuthor.textContent = `— ${data[0].a}`;
    } catch (err) {
      quoteText.textContent = "Could not load quote.";
      quoteAuthor.textContent = "";
    }
  }

  loadQuote();

  if (quoteButton) {
    quoteButton.addEventListener("click", loadQuote);
  }

  setInterval(loadQuote, 15 * 60 * 1000); // every 15 minutes
});
