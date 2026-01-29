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

module.exports = router;