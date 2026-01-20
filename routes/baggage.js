const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { baggage } = require("../models");
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
    Next Code Logic (Query by areaID & itemImageID)
================================================= */
router.get('/nextCode', async (req, res) => {
    const { areaID, itemImageID } = req.query;

    try {
        const lastRecord = await baggage.findOne({
            where: {
                areaID: parseInt(areaID),
                itemImageID: parseInt(itemImageID)
            },
            order: [['id', 'DESC']]
        });

        let nextNumber = 1;
        if (lastRecord && lastRecord.code) {
            // Extracts last 5 digits from "2026-...-T00005"
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

        const record = await baggage.create({
            top: `/uploads/baggage/${req.files.top[0].filename}`,
            side: `/uploads/baggage/${req.files.side[0].filename}`,
            areaID: req.body.areaID,
            itemImageID: req.body.itemImageID,
            itemCategoryID: req.body.itemCategoryID,
            examType: req.body.examType,
            code: req.body.code,
            itemPos: JSON.parse(req.body.itemPos || "{}")
        });

        res.json({ success: true, data: record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =================================================
    READ ONE (Must be BELOW nextCode)
================================================= */
router.get("/:id", async (req, res) => {
    try {
        const data = await baggage.findByPk(req.params.id);
        if (!data) return res.status(404).json({ error: "Not found" });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ... Include your existing READ ALL, UPDATE, DELETE routes here ...

module.exports = router;