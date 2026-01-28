const express = require('express');
const router = express.Router();
const { training_sessions } = require('../models');

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
        const sessions = await training_sessions.findAll({ 
            where: { userId },
            order: [['created_at', 'DESC']] 
        });

        // Logic การคำนวณค่าเฉลี่ยจาก JSON Data
        const aggregate = {};

        sessions.forEach(s => {
            const stats = s.category_stats; // ดึงมาเป็น Object อัตโนมัติด้วย Getter
            Object.keys(stats).forEach(catId => {
                if (!aggregate[catId]) {
                    aggregate[catId] = { hits: 0, total: 0, categoryId: catId };
                }
                aggregate[catId].hits += stats[catId].hits;
                aggregate[catId].total += stats[catId].total;
            });
        });

        // แปลงเป็น Array เพื่อให้ Frontend (เช่น Chart.js) ใช้งานได้ทันที
        const report = Object.keys(aggregate).map(id => ({
            categoryId: id,
            // คำนวณ % ความแม่นยำเฉลี่ยของหัวข้อนี้
            accuracy: aggregate[id].total > 0 
                ? ((aggregate[id].hits / aggregate[id].total) * 100).toFixed(2) 
                : 0
        }));

        res.json({
            success: true,
            totalSessions: sessions.length,
            data: report
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;