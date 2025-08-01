// Redirect to login page on logout
function logout() {
  window.location.href = "login.html";
}

// Update task status and send the update to the server
function updateStatus(taskId, button) {
  // Create popup container
  const popup = document.createElement('div');
  popup.className = 'status-popup';

  // Dropdown menu for status (✅ Now includes "To do")
  const select = document.createElement('select');
  ['To do', 'In progress', 'Done'].forEach(status => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    select.appendChild(option);
  });
  popup.appendChild(select);

  // Confirm button
  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Update';
  confirmBtn.onclick = async () => {
    const newStatus = select.value;

    // Update UI immediately
    const statusSpan = button.parentElement.querySelector('#task-status');
    statusSpan.textContent = newStatus;

    // Send update to server
    await fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    document.body.removeChild(popup);
  };
  popup.appendChild(confirmBtn);

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => document.body.removeChild(popup);
  popup.appendChild(cancelBtn);

  document.body.appendChild(popup);
}

// Load tasks from the server when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const employeeName = "Wissam"; // Replace with dynamic user if using sessions

  fetch(`http://localhost:3000/api/tasks/employee/${employeeName}`)
    .then(res => res.json())
    .then(tasks => {
      const container = document.querySelector('.employee-container');

      tasks.forEach(task => {
        const taskHTML = `
          <div class="task-card">
            <p><strong>Task:</strong> ${task.title}</p>
            <p><strong>Description:</strong> ${task.description}</p>
            <p><strong>Status:</strong> <span id="task-status">${task.status}</span></p>
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
