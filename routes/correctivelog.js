const express = require('express');
const router = express.Router();
const { correctiveLog, corrective } = require('../models'); // Adjust path to your models folder

// 1. CREATE a new log
router.post('/', async (req, res) => {
  try {
    const log = await correctiveLog.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 2. GET all logs (with associated Corrective data)
router.get('/', async (req, res) => {
  try {
    const logs = await correctiveLog.findAll({
      include: [{ model: corrective }] 
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET a specific log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await correctiveLog.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE a log
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await correctiveLog.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send("Deleted");
    } else {
      res.status(404).json({ message: 'Log not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;