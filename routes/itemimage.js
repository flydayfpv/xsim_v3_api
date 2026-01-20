'use strict';

const express = require('express');
const router = express.Router();
const { itemImage, itemCategory } = require('../models');
const upload = require('../middlewares/upload');


// =======================
// CREATE (POST) ✅ FIXED
// =======================
router.post(
  '/',
  upload.fields([
    { name: 'top', maxCount: 1 },
    { name: 'side', maxCount: 1 },
    { name: 'realImage', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        itemCategoryId,
        description
      } = req.body;

      const newItem = await itemImage.create({
        name,
        itemCategoryId,
        description,
        top: req.files?.top?.[0]?.path || null,
        side: req.files?.side?.[0]?.path || null,
        realImage: req.files?.realImage?.[0]?.path || null,
      });

      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Create itemImage failed' });
    }
  }
);


// =======================
// READ ALL
// =======================
router.get('/', async (req, res) => {
  try {
    const items = await itemImage.findAll({
      include: [{ model: itemCategory, as: 'category' }],
      order: [['id', 'ASC']]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Fetch itemImages failed' });
  }
});


// =======================
// READ BY CATEGORY
// =======================
router.get('/category/:categoryId', async (req, res) => {
  try {
    const items = await itemImage.findAll({
      where: { itemCategoryId: req.params.categoryId },
      include: [{ model: itemCategory, as: 'category' }]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Fetch items by category failed' });
  }
});


// =======================
// READ BY ID
// =======================
router.get('/:id', async (req, res) => {
  try {
    const item = await itemImage.findByPk(req.params.id, {
      include: [{ model: itemCategory, as: 'category' }]
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Fetch itemImage failed' });
  }
});


// =======================
// UPDATE (no file)
// =======================
router.put('/:id', async (req, res) => {
  try {
    const item = await itemImage.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Update itemImage failed' });
  }
});


// =======================
// DELETE
// =======================
router.delete('/:id', async (req, res) => {
  try {
    const item = await itemImage.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.destroy();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete itemImage failed' });
  }
});

module.exports = router;
