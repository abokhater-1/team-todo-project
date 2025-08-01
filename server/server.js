const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session'); // ✅ Session support
const User = require('./models/user');
const taskRoutes = require('./routes/taskRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes'); // ✅ Logout route

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = 3000;

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Session middleware
app.use(session({
  secret: 'my-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true only if using HTTPS
}));

// 🔒 Protect access to manager.html and employee.html
app.use((req, res, next) => {
  const protectedFiles = ['/manager.html', '/employee.html'];

  if (protectedFiles.includes(req.path)) {
    if (!req.session.user) {
      return res.redirect('/login.html');
    }

    // Optional role check
    if (req.path === '/manager.html' && req.session.user.role !== 'manager') {
      return res.status(403).send('❌ Access denied: Manager only');
    }
    if (req.path === '/employee.html' && req.session.user.role !== 'employee') {
      return res.status(403).send('❌ Access denied: Employee only');
    }
  }

  next();
});

// ✅ Static files (login.html, manager.html, employee.html, css, js, etc.)
app.use(express.static(path.join(__dirname, '..')));

// ✅ API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/auth', authRoutes); // logout

// ✅ Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

// ✅ Handle login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.send("❌ Invalid email or password.");
    }

    // ✅ Save session
    req.session.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    // ✅ Redirect based on role
    if (user.role === 'manager') {
      return res.redirect('/manager.html');
    } else if (user.role === 'employee') {
      return res.redirect('/employee.html');
    } else {
      return res.send("❌ User role not recognized.");
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).send("❌ Server error.");
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
