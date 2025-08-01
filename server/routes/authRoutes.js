const express = require('express');
const router = express.Router();

// Support both GET and POST for logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout failed:', err);
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login.html'); // Redirect to login page after logout
  });
});
// ✅ Export router
module.exports = router;