const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Public: list categories for browse filters (Web Dev, Design, AI, etc.)
router.get('/', async (req, res) => {
  const categories = await Category.find().sort('name');
  res.json({ success: true, categories });
});

module.exports = router;
