const express = require('express');
const router = express.Router();
const { correctiveType } = require('../models'); // Ensure this matches your export name

// 1. CREATE: Add a new type (e.g., "Urgent", "Routine")
router.post('/', async (req, res) => {
    try {
        const newType = await correctiveType.create({
            name: req.body.name
        });
        res.status(201).json(newType);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 2. READ ALL: Useful for population selection dropdowns
router.get('/', async (req, res) => {
    try {
        const types = await correctiveType.findAll({
            order: [['name', 'ASC']] // Alphabetical order is usually better for UI
        });
        res.json(types);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. UPDATE: Rename a type
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await correctiveType.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'Type not found' });
        res.json({ message: 'Type updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. DELETE: Remove a type
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await correctiveType.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Type not found' });
        res.json({ message: 'Type deleted successfully' });
    } catch (error) {
        // Note: This will fail if a 'corrective' record is still using this ID
        res.status(500).json({ error: "Cannot delete type while it's in use by corrective records." });
    }
});

module.exports = router;