const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { baggage, itemImage } = require("../models"); 
const { Op } = require('sequelize');

/* ---------------- MULTER CONFIG ---------------- */
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "uploads/baggage"); },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || ".png";
        cb(null, Date.now() + "-" + file.fieldname + ext);
    }
});
const upload = multer({ storage });

/* =================================================
    CREATE (Canvas Upload) - LOOP INSERT BY AREA
================================================= */
router.post("/canvas-upload", upload.fields([
    { name: "top", maxCount: 1 },
    { name: "side", maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files?.top || !req.files?.side) {
            return res.status(400).json({ error: "Images required" });
        }

        // 1. แปลง areaIDs จาก JSON string (เช่น "[1,2]") เป็น Array
        let areaIDs = [];
        try {
            areaIDs = JSON.parse(req.body.areaIDs || "[1]");
        } catch (e) {
            areaIDs = [parseInt(req.body.areaIDs)]; 
        }

        // 2. จัดการข้อมูล Item ID
        const itemImageID = !req.body.itemImageID || req.body.itemImageID === "0" || req.body.itemImageID === "null"
            ? null 
            : parseInt(req.body.itemImageID);

        const itemPos = JSON.parse(req.body.itemPos || "{}");
        const topPath = `/uploads/baggage/${req.files.top[0].filename}`;
        const sidePath = `/uploads/baggage/${req.files.side[0].filename}`;

        const results = [];

        // 3. ✨ LOOP INSERT ตามจำนวนพื้นที่ที่เลือก
        // ทุกพื้นที่ใน Loop จะใช้ไฟล์ภาพเดียวกัน (Path เดียวกัน)
        for (const id of areaIDs) {
            const record = await baggage.create({
                top: topPath,
                side: sidePath,
                areaID: parseInt(id),
                itemImageID: itemImageID,
                itemCategoryID: parseInt(req.body.itemCategoryID),
                examType: req.body.examType,
                code: req.body.code,
                itemPos: itemPos,
                isPreExisting: parseInt(req.body.isPreExisting || 0)
            });
            results.push(record);
        }

        res.json({ 
            success: true, 
            message: `Created ${results.length} records successfully`,
            data: results 
        });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* =================================================
    Next Code Logic
================================================= */
router.get('/nextCode', async (req, res) => {
    const { areaID, itemCategoryID } = req.query;

    try {
        const lastRecord = await baggage.findOne({
            where: {
                areaID: parseInt(areaID), 
                itemCategoryID: parseInt(itemCategoryID)
            },
            order: [['id', 'DESC']]
        });

        let nextNumber = 1;
        if (lastRecord && lastRecord.code) {
            // ดึง 5 หลักสุดท้ายมาบวกเพิ่ม
            const lastFive = lastRecord.code.slice(-5);
            const parsed = parseInt(lastFive, 10);
            if (!isNaN(parsed)) nextNumber = parsed + 1;
        }

        res.json({ nextNumber: String(nextNumber).padStart(5, '0') });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =================================================
    FIND ALL BY AREA & CATEGORY
================================================= */
router.get('/filter', async (req, res) => {
    const { areaID, itemCategoryID } = req.query;
    try {
        const whereCondition = {};
        if (itemCategoryID) whereCondition.itemCategoryID = parseInt(itemCategoryID);
        if (areaID) whereCondition.areaID = parseInt(areaID);

        const data = await baggage.findAll({
            where: whereCondition,
            include: [{
                model: itemImage, 
                as: 'item', 
                attributes: ['name', 'top', 'side', 'realImage', 'description']
            }],
            order: [['id', 'DESC']]
        });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =================================================
    READ ONE & DELETE
================================================= */
router.get("/:id", async (req, res) => {
    try {
        const data = await baggage.findByPk(req.params.id, {
            include: [{
                model: itemImage, as: 'item', 
                attributes: ['name', 'top', 'side', 'realImage', 'description']
            }],
        });
        if (!data) return res.status(404).json({ error: "Not found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await baggage.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Baggage not found' });
        res.json({ message: 'Baggage deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;