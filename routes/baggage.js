const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { baggage } = require("../models");

/* ---------------- MULTER CONFIG ---------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/baggage");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, Date.now() + "-" + file.fieldname + ext);
  }
});

const upload = multer({ storage });

/* =================================================
   CREATE (Canvas Upload)
================================================= */
router.post(
  "/canvas-upload",
  upload.fields([
    { name: "top", maxCount: 1 },
    { name: "side", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files?.top || !req.files?.side) {
        return res.status(400).json({ error: "Images required" });
      }

      const record = await baggage.create({
        top: `/uploads/baggage/${req.files.top[0].filename}`,
        side: `/uploads/baggage/${req.files.side[0].filename}`,
        areaID: req.body.areaID,
        itemImageID: req.body.itemImageID,
        itemPos: JSON.parse(req.body.itemPos || "{}")
      });

      res.json({ success: true, data: record });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =================================================
   READ ALL
================================================= */
router.get("/", async (req, res) => {
  try {
    const data = await baggage.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =================================================
   READ ONE
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

/* =================================================
   UPDATE (replace canvas images optional)
================================================= */
router.put(
  "/:id",
  upload.fields([
    { name: "top", maxCount: 1 },
    { name: "side", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const record = await baggage.findByPk(req.params.id);
      if (!record) return res.status(404).json({ error: "Not found" });

      const updateData = {
        areaID: req.body.areaID,
        itemImageID: req.body.itemImageID,
        itemPos: req.body.itemPos
          ? JSON.parse(req.body.itemPos)
          : record.itemPos
      };

      if (req.files?.top) {
        updateData.top = `/uploads/baggage/${req.files.top[0].filename}`;
      }

      if (req.files?.side) {
        updateData.side = `/uploads/baggage/${req.files.side[0].filename}`;
      }

      await record.update(updateData);
      res.json({ success: true, data: record });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =================================================
   DELETE
================================================= */
router.delete("/:id", async (req, res) => {
  try {
    const record = await baggage.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Not found" });

    await record.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
