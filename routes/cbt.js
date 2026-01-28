const express = require('express');
const router = express.Router();
const { baggage, itemImage, area, itemCategory, sequelize } = require('../models');

// ✅ ปรับ Route ให้รับทั้ง areaID และ categoryID
// ตัวอย่าง URL: /random/1/2 (เฉพาะหมวดหมู่ 2) หรือ /random/1/all (ทุกหมวดหมู่ในพื้นที่ 1)
// backend/routes/cbt.js
router.get('/random/:areaID/:categoryID', async (req, res) => {
    try {
        const { areaID, categoryID } = req.params;

        let whereCondition = {};
        
        // กรอง AreaID เสมอ (ถ้าไม่ใช่ 'all')
        if (areaID !== 'all') {
            whereCondition.areaID = parseInt(areaID);
        }

        // ✅ กรอง CategoryID เฉพาะเมื่อไม่ใช่ 'all'
        if (categoryID !== 'all') {
            whereCondition.itemCategoryID = parseInt(categoryID);
        }

        const result = await baggage.findAll({
            where: whereCondition,
            order: sequelize.random(),
            include: [{ model: itemImage, as: 'item' }]
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database Query Error" });
    }
});

module.exports = router;