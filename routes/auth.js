'use strict';
const express = require('express');
const router = express.Router();
const { user, session, prefix, division, department, role } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // นำเข้า bcrypt สำหรับการ Hash
const { Op } = require('sequelize');
const { authSession } = require('../middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const SALT_ROUNDS = 12; // กำหนดตามที่คุณต้องการ (12 rounds)

/* ==================================
    1. GET USER PROFILE (By ID)
   ================================== */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const foundUser = await user.findByPk(userId, {
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

/* ==================================
    2. LOGIN (With Session Control)
   ================================== */
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    const foundUser = await user.findOne({
      where: {
        [Op.or]: [{ emid: login }, { citizenid: login }]
      }
    });

    if (!foundUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔐 ตรวจสอบรหัสผ่าน (bcrypt.compare จะเช็คกับ hash ใน DB เอง)
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 🔥 ลบ session เก่าทิ้ง (Concurrency control)
    await session.destroy({ where: { userID: foundUser.id } });

    const accessToken = jwt.sign(
      { userID: foundUser.id, roleID: foundUser.roleID },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userID: foundUser.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await session.create({
      userID: foundUser.id,
      refresh_token: refreshToken,
      device_id: req.headers['x-device-id'] || null,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      last_active_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({
      message: 'Login success',
      accessToken,
      refreshToken,
      user: {
        id: foundUser.id,
        fname: foundUser.fname,
        lname: foundUser.lname,
        roleID: foundUser.roleID,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

/* ==================================
    3. CREATE USER (With Hashing)
   ================================== */
router.post('/users', async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // Hash password ก่อนบันทึกถ้ามีส่งมา
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, SALT_ROUNDS);
    }

    const newUser = await user.create(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ==================================
    4. UPDATE USER (With Hashing)
   ================================== */
router.put('/users/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    // 🔐 ถ้ามีการส่ง password ใหม่มา (เช่น จากหน้า Change Password Modal)
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    const [updated] = await user.update(updateData, {
      where: { id: req.params.id }
    });

    if (!updated) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ==================================
    5. LOGOUT
   ================================== */
router.post('/logout', authSession, async (req, res) => {
  try {
    // ลบ session ออกจาก DB ผ่าน middleware req.session
    await req.session.destroy();
    res.json({ message: 'Logout success' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;