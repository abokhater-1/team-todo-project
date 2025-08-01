// 🔐 Redirect to login page on logout
function logout() {
  window.location.href = "login.html";
}

// 🔄 Update task status
function updateStatus(taskId, button) {
  const popup = document.createElement('div');
  popup.className = 'status-popup';

  const select = document.createElement('select');
  ['To do', 'In progress', 'Completed'].forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  });
  popup.appendChild(select);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Update';
  confirmBtn.onclick = async () => {
    const newStatus = select.value;

    // Update UI immediately (fix: use generic <span> instead of ID)
    const statusSpan = button.parentElement.querySelector('span');
    statusSpan.textContent = newStatus;

    // Send to server
    await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    document.body.removeChild(popup);
    location.reload(); // Optional: refresh to reflect changes
  };
  popup.appendChild(confirmBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => document.body.removeChild(popup);
  popup.appendChild(cancelBtn);

  document.body.appendChild(popup);
}

// 📥 Load employee tasks
document.addEventListener("DOMContentLoaded", () => {
  const employeeName = "Wissam"; // Replace with dynamic session-based name if available

  fetch(`/api/tasks/employee/${employeeName}`)
    .then(res => res.json())
    .then(tasks => {
      const container = document.querySelector('.employee-container');

      tasks.forEach(task => {
        const taskHTML = `
          <div class="task-card">
            <p><strong>Task:</strong> ${task.title}</p>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Status:</strong> <span>${task.status}</span></p>
            <p><strong>Assigned by:</strong> ${task.assignedBy || "Manager"}</p>
            <button class="update-btn" onclick="updateStatus('${task._id}', this)">Update status</button>
          </div>
        `;
        container.insertAdjacentHTML("beforeend", taskHTML);
      });
    })
    .catch(err => {
      console.error("Error loading tasks:", err);
    });
});

// 💬 Quote System (zenquotes.io)
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

  setInterval(loadQuote, 15 * 60 * 1000);
});
