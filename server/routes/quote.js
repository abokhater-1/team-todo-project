const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/quote', async (req, res) => {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Failed to fetch quote:', err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

module.exports = router;
