const express = require('express');
const router = express.Router();
const { training_sessions } = require('../models');
const { Op, fn, col, where } = require('sequelize');


router.get('/years/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const years = await training_sessions.findAll({
            attributes: [[fn('DISTINCT', fn('YEAR', col('createdAt'))), 'year']],
            where: { userId },
            order: [[fn('YEAR', col('createdAt')), 'DESC']],
            raw: true
        });
        const yearList = years.map(item => item.year).filter(y => y !== null);
        if (yearList.length === 0) yearList.push(new Date().getFullYear());
        res.json({ success: true, years: yearList });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// ---------------------------------------------------------
// 1. POST: Save Training Session
// ใช้เรียกเมื่อ Operator ทำแบบทดสอบจบในหน้า Summary
// ---------------------------------------------------------
// ใน trainingController.js หรือไฟล์ Route ของคุณ
router.post('/save', async (req, res) => {
    try {
        const { 
            userId, score, hits, fars, efficiency, 
            timeUsed, categoryStats, wrongAnswers 
        } = req.body;

        const session = await training_sessions.create({
            userId: userId, // บันทึก ID ผู้ใช้ที่ส่งมา
            score: score,
            hits: hits,
            fars: fars,
            hitsRate: efficiency,
            time_used: timeUsed,
            // บังคับแปลงเป็น String เพื่อป้องกัน Error "cannot be an array or object"
            category_stats: JSON.stringify(categoryStats), 
            wrong_answers: JSON.stringify(wrongAnswers)
        });

        res.status(201).json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("DB Save Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});+

// ---------------------------------------------------------
// 2. GET: Category Average Analytics
// ใช้สำหรับดึงข้อมูลไปทำกราฟ Radar Chart หรือดูจุดอ่อนแยกหัวข้อ
// ---------------------------------------------------------
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { year } = req.query;

        const filter = { userId };

        if (year) {
            // ✅ Change col('created_at') to col('createdAt')
            filter[Op.and] = [
                where(fn('YEAR', col('createdAt')), year)
            ];
        }

        const sessions = await training_sessions.findAll({ 
            where: filter,
            // ✅ Change 'created_at' to 'createdAt'
            order: [['createdAt', 'DESC']] 
        });

        if (sessions.length === 0) {
            return res.json({ success: true, totalSessions: 0, data: [] });
        }

        // ... rest of your logic
        res.json({ success: true, data: sessions });

    } catch (error) {
        console.error("DB Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ---------------------------------------------------------
// 3. GET: Get Available Years for a User
// ใช้สำหรับดึงรายการปีทั้งหมดที่ User เคยทดสอบ เพื่อทำ Dropdown Filter
// ---------------------------------------------------------
// Backend: trainingController.js
router.get('/stats-daily/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { year } = req.query;

        const dailyStats = await training_sessions.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('COUNT', col('id')), 'sessionCount'],
                // ✅ ผลรวมของเวลาที่ใช้ทั้งหมดในวันนั้น
                [fn('SUM', col('time_used')), 'totalTime'], 
                // ✅ ค่าเฉลี่ยของความแม่นยำ
                [fn('AVG', col('hitsRate')), 'avgHitsRate'],
                // ✅ ค่าเฉลี่ยของ Hits ต่อรอบ
                [fn('AVG', col('hits')), 'avgHits'],
                // ✅ ค่าเฉลี่ยของคะแนนต่อรอบ
                [fn('AVG', col('score')), 'avgScore']
            ],
            where: {
                userId,
                [Op.and]: [where(fn('YEAR', col('createdAt')), year || 2026)]
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'DESC']],
            raw: true
        });

        res.json({ success: true, data: dailyStats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// ---------------------------------------------------------
// 4. GET: Get Stats Grouped by Date
// ดึงข้อมูลสรุปรายวัน เพื่อทำกราฟเส้นหรือตารางสรุปรายวัน
// ---------------------------------------------------------
// ---------------------------------------------------------
// 4. GET: Get Stats Grouped by Date (FIXED)
// ---------------------------------------------------------

module.exports = router;