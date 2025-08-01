// routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// ✅ Add new employee
router.post('/', async (req, res) => {
  try {
    const { employeeId, name, email, role } = req.body;

    // Check if email already exists
    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Employee already exists' });
    }

    const employee = new Employee({ employeeId, name, email, role });
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    console.error('❌ Error creating employee:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (err) {
    console.error('❌ Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

module.exports = router;
