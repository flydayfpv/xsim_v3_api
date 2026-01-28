const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { baggage,itemImage } = require("../models");
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
    FIND ALL BY AREA & CATEGORY
    URL: /baggages/filter?areaID=1&itemCategoryID=2
================================================= */
router.get('/filter', async (req, res) => {
    const { areaID, itemCategoryID } = req.query;
 
    try {
        // ตรวจสอบเงื่อนไขการค้นหา
        const whereCondition = {};
        if (areaID) whereCondition.areaID = parseInt(areaID);
        if (itemCategoryID) whereCondition.itemCategoryID = parseInt(itemCategoryID);

        const data = await baggage.findAll({
            where: whereCondition,
            include: [{
                // ดึงข้อมูลภาพไอเทมดิบและภาพจริงมาจาก itemImage
                model: require('../models').itemImage, 
                as: 'item', 
                attributes: ['name', 'top', 'side', 'realImage', 'description']
            }],
            order: [['id', 'DESC']] // เอาภาพใหม่ขึ้นก่อน
        });

        res.json(data);
    } catch (err) {
        console.error("Filter Error:", err);
        res.status(500).json({ error: err.message });
    }
});


/* =================================================
    Next Code Logic (Query by areaID & itemCategoryID)
================================================= */
router.get('/nextCode', async (req, res) => {
    // เปลี่ยนจากรับ itemImageID เป็น itemCategoryID
    const { areaID, itemCategoryID } = req.query;

    try {
        const lastRecord = await baggage.findOne({
            where: {
                areaID: parseInt(areaID),
                itemCategoryID: parseInt(itemCategoryID) // ค้นหาตามหมวดหมู่
            },
            order: [['id', 'DESC']]
        });

        let nextNumber = 1;
        if (lastRecord && lastRecord.code) {
            // ดึงเลข 5 หลักสุดท้าย เช่น "00005" จาก "2026-...-T00005"
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
    CREATE (Canvas Upload)
================================================= */
router.post("/canvas-upload", upload.fields([
    { name: "top", maxCount: 1 },
    { name: "side", maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files?.top || !req.files?.side) {
            return res.status(400).json({ error: "Images required" });
        }

        // ✨ FIX: Convert empty string to null for the database
        const itemImageID = req.body.itemImageID === "" || req.body.itemImageID === "null" 
            ? null 
            : parseInt(req.body.itemImageID);

        const record = await baggage.create({
            top: `/uploads/baggage/${req.files.top[0].filename}`,
            side: `/uploads/baggage/${req.files.side[0].filename}`,
            areaID: parseInt(req.body.areaID),
            itemImageID: itemImageID, // Will be null if it's a "Clear" category
            itemCategoryID: parseInt(req.body.itemCategoryID),
            examType: req.body.examType,
            code: req.body.code,
            itemPos: JSON.parse(req.body.itemPos || "{}")
        });

        res.json({ success: true, data: record });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: err.message });
    }
});

/* =================================================
    READ ONE (Included Item Data)
================================================= */
router.get("/:id", async (req, res) => {
    try {
        const data = await baggage.findByPk(req.params.id, {
            // ดึงข้อมูลจาก Model item ที่มีความสัมพันธ์กันมาด้วย
            include: [{
                // ดึงข้อมูลภาพไอเทมดิบและภาพจริงมาจาก itemImage
                model: require('../models').itemImage, 
                as: 'item', 
                attributes: ['name', 'top', 'side', 'realImage', 'description']
            }],
        });

        if (!data) return res.status(404).json({ error: "Not found" });
        
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... Include your existing READ ALL, UPDATE, DELETE routes here ...

module.exports = router;