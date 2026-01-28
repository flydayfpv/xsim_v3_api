'use strict';
const express = require('express');
const router = express.Router();
const { user, session, prefix, division, department, role } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { authSession } = require('../middleware');

const JWT_SECRET = process.env.JWT_SECRET;

/* ==================================
    USER PROFILE (ดึงชื่อ Operator)
   ================================== */
// Endpoint: GET /users/:id
// ใช้สำหรับดึงข้อมูล fname, lname มาแสดงในหน้า Summary
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const foundUser = await user.findByPk(userId, {
      attributes: ['fname', 'lname', 'id'], // ดึงเฉพาะฟิลด์ที่จำเป็น
      include: [
        {
          model: prefix,
          attributes: ['name'] // ดึง "นาย/นาง/นางสาว" มาด้วย
        },
        {
          model: division,
          attributes: ['name'] // เผื่อแสดงสังกัด
        }
      ]
    });

    if (!foundUser) {
      return res.status(404).json({ message: 'User not found' });
    }

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

/* =========================
    LOGIN
   ========================= */
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    const foundUser = await user.findOne({
      where: {
        [Op.or]: [
          { emid: login },
          { citizenid: login }
        ]
      }
    });

    if (!foundUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // 🔥 Kill old sessions (Concurrency control)
    await session.destroy({
      where: { userID: foundUser.id }
    });

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

/* =========================
    LOGOUT
   ========================= */
router.post('/logout', authSession, async (req, res) => {
  try {
    // ลบ session ออกจาก DB
    await req.session.destroy();
    res.json({ message: 'Logout success' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;