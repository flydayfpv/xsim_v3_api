'use strict';
const express = require('express');
const router = express.Router();
const { user, session, prefix, division, LoginHistory } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { authSession } = require('../middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const SALT_ROUNDS = 12;

// --- Config Multer สำหรับเก็บภาพใบหน้าตอน Login ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/logins/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.body.login || 'unknown';
    cb(null, `face_${userId}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

/* ==================================
    1. LOGIN (With Concurrency Control & Face Record)
   ================================== */
router.post('/login', upload.single('image'), async (req, res) => {
  try {
    const { login, password, hwid, faceVector } = req.body;

    const foundUser = await user.findOne({
      where: { [Op.or]: [{ emid: login }, { citizenid: login }] }
    });

    if (!foundUser) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    // --- 🛡️ เช็คเงื่อนไข 30 นาที และ HWID ---
    if (foundUser.lastLogin) {
      const diffInMinutes = (new Date() - new Date(foundUser.lastLogin)) / (1000 * 60);

      if (diffInMinutes < 30) {
        // ดึงประวัติล่าสุดมาเช็คว่าเครื่องเดิมไหม
        const lastHistory = await LoginHistory.findOne({
          where: { userId: foundUser.id },
          order: [['loginAt', 'DESC']]
        });

        // ถ้าไม่ใช่เครื่องเดิม (HWID ไม่ตรง) ให้บล็อก
        if (lastHistory && lastHistory.hwid !== hwid) {
          const timeLeft = Math.ceil(30 - diffInMinutes);
          return res.status(403).json({ 
            status: 'error', 
            message: `Account in use elsewhere. Please wait ${timeLeft} mins.` 
          });
        }
      }
    }

    // 🔐 Verify Password
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid password' });
    }

    // --- 📸 ภาคบันทึกประวัติใบหน้า (FIFO 10) ---
    await LoginHistory.create({
      userId: foundUser.id,
      hwid: hwid || 'unknown',
      imagePath: req.file ? req.file.path : null,
      faceVector: faceVector, // เก็บสตริงอาเรย์จาก Python
      loginAt: new Date()
    });

    // FIFO Logic: ลบรายการที่ 11 ทิ้ง
    const historyCount = await LoginHistory.count({ where: { userId: foundUser.id } });
    if (historyCount > 10) {
      const oldestRecords = await LoginHistory.findAll({
        where: { userId: foundUser.id },
        order: [['loginAt', 'ASC']],
        limit: historyCount - 10
      });
      for (const old of oldestRecords) {
        if (old.imagePath && fs.existsSync(old.imagePath)) {
          try { fs.unlinkSync(old.imagePath); } catch (e) {}
        }
        await old.destroy();
      }
    }

    // --- 🔥 จัดการ Session & Token ---
    await session.destroy({ where: { userID: foundUser.id } });

    const accessToken = jwt.sign(
      { userID: foundUser.id, roleID: foundUser.roleID },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign({ userID: foundUser.id }, JWT_SECRET, { expiresIn: '7d' });

    await session.create({
      userID: foundUser.id,
      refresh_token: refreshToken,
      device_id: hwid || null,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      last_active_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // อัปเดตเวลาใช้งานล่าสุด
    await foundUser.update({ lastLogin: new Date() });

    res.json({
      status: 'success',
      accessToken,
      refreshToken,
      user: {
        id: foundUser.id,
        emid: foundUser.emid,
        fname: foundUser.fname,
        lname: foundUser.lname,
        roleID: foundUser.roleID,
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Login error', error: err.message });
  }
});

/* ==================================
    2. GET FACE HISTORY (For Python Verification)
   ================================== */
router.get('/face-history/:emid', async (req, res) => {
  try {
    const foundUser = await user.findOne({ where: { emid: req.params.emid } });
    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    const history = await LoginHistory.findAll({
      where: { userId: foundUser.id },
      order: [['loginAt', 'DESC']],
      limit: 10,
      attributes: ['faceVector', 'imagePath', 'loginAt']
    });

    res.json({ status: 'success', history });
  } catch (err) {
    res.status(500).json({ message: 'Fetch history failed', error: err.message });
  }
});

/* ==================================
    3. GET USER PROFILE
   ================================== */
router.get('/users/:id', async (req, res) => {
  try {
    const foundUser = await user.findByPk(req.params.id, {
      attributes: ['fname', 'lname', 'id', 'emid'],
      include: [
        { model: prefix, attributes: ['name'] },
        { model: division, attributes: ['name'] }
      ]
    });

    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: foundUser.id,
      emid: foundUser.emid,
      prefix: foundUser.prefix?.name || '',
      firstName: foundUser.fname,
      lastName: foundUser.lname,
      division: foundUser.division?.name || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Fetch user failed', error: err.message });
  }
});

// ... [CREATE USER & UPDATE USER & LOGOUT คงเดิมตาม Logic ที่คุณมี] ...

module.exports = router;