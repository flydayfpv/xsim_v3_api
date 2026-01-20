'use strict';

const express = require('express');
const router = express.Router();
const { itemCategory } = require('../models');

// GET all item categories
router.get('/', async (req, res) => {
  try {
    const categories = await itemCategory.findAll({
      order: [['id', 'ASC']]
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
