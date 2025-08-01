// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// ✅ Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Add a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, assignedTo, assignedBy, status } = req.body;
    const newTask = new Task({ title, description, assignedTo, assignedBy, status });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: 'Invalid task data' });
  }
});

// ✅ Edit task (title, description, assignedTo, status)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, assignedTo, status } = req.body;

    // Check for missing required fields
    if (!title || !description || !assignedTo || !status) {
      return res.status(400).json({ error: 'All fields are required to update task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(400).json({ error: 'Failed to update task', details: err.message });
  }
});

// ✅ Update task status only
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // ✅ Validate the status value BEFORE updating
  if (!['To do', 'In progress', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});


// ✅ Add a comment to task
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;

    // 🔒 Comment text validation
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.comments.push(text);
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    console.error('❌ Error adding comment:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ✅ Delete task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
});
// ✅ Get recent comments for a task
router.get('/:id/comments', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const recent = task.comments.slice(-5); // Last 5 comments
    res.json(recent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ✅ Get tasks assigned to a specific employee by name
router.get('/employee/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const tasks = await Task.find({ assignedTo: name });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee tasks' });
  }
});

module.exports = router;