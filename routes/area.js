'use strict';

const express = require('express');
const router = express.Router();
const { area } = require('../models');


// =======================
// CREATE (POST)
// =======================
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    const newArea = await area.create({ name });

    res.status(201).json(newArea);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Create area failed' });
  }
});


// =======================
// READ ALL (GET)
// =======================
router.get('/', async (req, res) => {
  try {
    const areas = await area.findAll({
      order: [['id', 'ASC']]
    });

    res.status(200).json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Fetch areas failed' });
  }
});


// =======================
// READ ONE BY ID (GET)
// =======================
router.get('/:id', async (req, res) => {
  try {
    const areaData = await area.findByPk(req.params.id);

    if (!areaData) {
      return res.status(404).json({ message: 'Area not found' });
    }

    res.status(200).json(areaData);
  } catch (error) {
    res.status(500).json({ message: 'Fetch area failed' });
  }
});


// =======================
// UPDATE (PUT)
// =======================
router.put('/:id', async (req, res) => {
  try {
    const areaData = await area.findByPk(req.params.id);

    if (!areaData) {
      return res.status(404).json({ message: 'Area not found' });
    }

    await areaData.update(req.body);

    res.status(200).json(areaData);
  } catch (error) {
    res.status(500).json({ message: 'Update area failed' });
  }
});


// =======================
// DELETE (DELETE)
// =======================
router.delete('/:id', async (req, res) => {
  try {
    const areaData = await area.findByPk(req.params.id);

    if (!areaData) {
      return res.status(404).json({ message: 'Area not found' });
    }

    await areaData.destroy();

    res.status(200).json({ message: 'Area deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete area failed' });
  }
});

module.exports = router;
