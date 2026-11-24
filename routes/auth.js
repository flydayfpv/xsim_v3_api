'use strict';
const express = require('express');
const router = express.Router();
const { user, session, prefix, division, role } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET 
const SALT_ROUNDS = 12;

// --- 1. Multer Setup (เหมือนเดิม) ---
const uploadDir = 'uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `face-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

/* ==================================
    API: UPLOAD FACE
   ================================== */
router.post('/upload-face', upload.single('face_image'), async (req, res) => {
    try {
        const { userID } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        if (!userID) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Missing userID' });
        }

        const webPath = req.file.path.replace(/\\/g, "/");
        await user.update({ face_img: webPath }, { where: { id: userID } });

        res.json({ message: 'Upload success', path: webPath });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

/* ==================================
    API: LOGIN (FIXED BASED ON IMAGE)
   ================================== */
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        // แก้ไข: เปลี่ยนจาก citizenid เป็น idcard ตามรูปใน DB ของคุณ
        const foundUser = await user.findOne({
            where: { 
                [Op.or]: [
                    { emid: login }, 
                    { idcard: login } // แก้จุดนี้
                ] 
            },
            include: [
                { model: prefix, attributes: ['name'] }, // ดึงคำนำหน้า
                { model: division, attributes: ['name'] }, // ดึงแผนก
                { model: role, attributes: ['name'] } // ดึงสิทธิ์
            ]
        });

        // Debug: ดูว่าหา User เจอไหม
        if (!foundUser) {
            console.log(`User Not Found: ${login}`);
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // ตรวจสอบรหัสผ่านด้วย Bcrypt
        const isMatch = await bcrypt.compare(password, foundUser.password);
        
        if (!isMatch) {
            console.log(`Password Mismatch for: ${login}`);
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        // ลบ Session เก่า (Single Login Policy)
        await session.destroy({ where: { userID: foundUser.id } });

        // สร้าง Tokens
        const accessToken = jwt.sign(
            { userID: foundUser.id, roleID: foundUser.roleID }, 
            JWT_SECRET, 
            { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
            { userID: foundUser.id }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // บันทึก Session ใหม่
        await session.create({
            userID: foundUser.id,
            refresh_token: refreshToken,
            ip_address: req.ip,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // ส่งข้อมูลกลับ (ห้ามส่ง Password กลับไป)
        const userResponse = foundUser.toJSON();
        delete userResponse.password;

        res.json({ 
            message: 'Login success', 
            accessToken, 
            refreshToken, 
            user: userResponse 
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;