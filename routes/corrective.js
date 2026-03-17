const express = require('express');
const router = express.Router();
const { corrective, correctiveType } = require('../models');
const { Op } = require('sequelize');
// GET ALL TYPES
router.get('/correctiveType', async (req, res) => {
    try {
        const results = await correctiveType.findAll({ order: [['name', 'ASC']] });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE RECORD
router.post('/', async (req, res) => {
    try {
        // Ensure the destructuring matches the frontend JSON keys
        const { userId, itemCategoryId, correctiveTypeId, timeTarget, remark, areaId } = req.body;
        const data = await corrective.create({
            userId,
            itemCategoryId,
            correctiveTypeId,
            timeTarget: timeTarget * 60,
            remark,
            areaId
        });
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/emid/:emid/performance', async (req, res) => {
    try {
        const { emid } = req.params;
        const { criteria, timeGet } = req.query;

        let timeCondition = {};
        const actualTime = Number(timeGet);

        // Logic based on your time comparison request
        if (criteria === 'morethan') {
            // Success: Target is GREATER than the actual time taken
            timeCondition = { timeTarget: { [Op.gt]: actualTime } };
        } else if (criteria === 'lessthan') {
            // Failure: Target is LESS than the actual time taken
            timeCondition = { timeTarget: { [Op.lt]: actualTime } };
        }

        const results = await corrective.findAll({
            where: {
                userId: emid,
                ...timeCondition
            },
            include: [{ model: correctiveType, as: 'type' }],
            order: [['createdAt', 'DESC']]
        });

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Example of what your association should look like elsewhere:
// corrective.belongsTo(models.correctiveType, { foreignKey: 'typeId', as: 'type' });
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await corrective.findByPk(id, {
            include: [{ model: correctiveType, as: 'type' }]
        });
        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ message: 'Record not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/allbyid/:id', async (req, res) => {
    try {
        const { id } = req.params; // Destructure for cleaner code

        const results = await corrective.findAll({
            where: { userId: id },
            include: [{ 
                model: correctiveType, 
                as: 'type' // Ensure this matches your association definition
            }],
            order: [['createdAt', 'DESC']]
        });

        // Good practice: Return 404 if no data is found (Optional)
        if (!results) {
            return res.status(404).json({ message: "No records found for this user." });
        }

        res.json(results);
    } catch (error) {
        console.error("Database Error:", error); // Log the error for debugging
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: error.message 
        });
    }
});

// READ ALL WITH ALIAS
router.get('/', async (req, res) => {
    try {
        const results = await corrective.findAll({
            include: [{ model: correctiveType, as: 'type' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/add-time', async (req, res) => {
    try {
        const { id } = req.params;
        const { timeEarned } = req.body; // Expecting just the 20, 16, 14, etc.

        // Update only the timeGet by adding the new value
        const record = await corrective.findByPk(id);
        
        if (record) {
            await record.increment('timeGet', { by: timeEarned });
            await record.reload(); // Refresh to get the new total
            return res.json(record);
        }
        
        res.status(404).json({ error: 'Corrective record not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;