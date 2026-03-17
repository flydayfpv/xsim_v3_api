'use strict';

const express = require('express');
const router = express.Router();
const { pagecomponent } = require('../models');

// =======================
// CREATE (POST)
// =======================
router.post('/', async (req, res) => {
  try {
    const { component, description } = req.body;

    const newComponent = await pagecomponent.create({ 
      component, 
      description 
    });

    res.status(201).json(newComponent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Create pagecomponent failed' });
  }
});

// =======================
// READ ALL (GET)
// =======================
router.get('/', async (req, res) => {
  try {
    const components = await pagecomponent.findAll({
      order: [['id', 'ASC']]
    });

    res.status(200).json(components);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetch pagecomponents failed' });
  }
});

// =======================
// READ ONE BY ID (GET)
// =======================
router.get('/:id', async (req, res) => {
  try {
    const componentData = await pagecomponent.findByPk(req.params.id);

    if (!componentData) {
      return res.status(404).json({ message: 'Pagecomponent not found' });
    }

    res.status(200).json(componentData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fetch pagecomponent failed' });
  }
});

// =======================
// UPDATE (PUT)
// =======================
router.put('/:id', async (req, res) => {
  try {
    const componentData = await pagecomponent.findByPk(req.params.id);

    if (!componentData) {
      return res.status(404).json({ message: 'Pagecomponent not found' });
    }

    // อัปเดตข้อมูลตามที่ส่งมาจาก req.body (เช่น component หรือ description)
    await componentData.update(req.body);

    res.status(200).json(componentData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update pagecomponent failed' });
  }
});

// =======================
// DELETE (DELETE)
// =======================
router.delete('/:id', async (req, res) => {
  try {
    const componentData = await pagecomponent.findByPk(req.params.id);

    if (!componentData) {
      return res.status(404).json({ message: 'Pagecomponent not found' });
    }

    await componentData.destroy();

    res.status(200).json({ message: 'Pagecomponent deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Delete pagecomponent failed' });
  }
});

module.exports = router;