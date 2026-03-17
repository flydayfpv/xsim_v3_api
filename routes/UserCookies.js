'use strict';
const express = require('express');
const router = express.Router();
const { user, session, role } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_key';

/* ==================================
    1. LOGIN (EMID or Citizen ID)
   ================================== */
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        // ค้นหาผู้ใช้ด้วย emid หรือ citizenid
        const foundUser = await user.findOne({
            where: { [Op.or]: [{ emid: login }, { citizenid: login }] },
            include: [{ model: role, attributes: ['name'] }]
        });

        if (!foundUser) {
            return res.status(401).json({ message: 'ไม่พบผู้ใช้งานในระบบ' });
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' });
        }

        // 🔥 Single Session Control: ลบ session เก่าทิ้ง
        await session.destroy({ where: { userID: foundUser.id } });

        // สร้าง Access Token (30 นาที)
        const accessToken = jwt.sign(
            { userID: foundUser.id, role: foundUser.role?.name },
            JWT_SECRET,
            { expiresIn: '30m' }
        );

        // สร้าง Refresh Token (7 วัน)
        const refreshToken = jwt.sign(
            { userID: foundUser.id },
            REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // บันทึกลงฐานข้อมูล
        await session.create({
            userID: foundUser.id,
            refresh_token: refreshToken,
            ip_address: req.ip || req.headers['x-forwarded-for'],
            user_agent: req.headers['user-agent'],
            last_active_at: new Date(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // 🍪 ส่ง HttpOnly Cookie (Access Token)
        res.cookie('auth_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 60 * 1000 // 30 นาที
        });

        // 🍪 ส่ง HttpOnly Cookie (Refresh Token - ปลอดภัยกว่าส่งใน JSON)
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 วัน
        });

        res.json({
            message: 'Login success',
            user: { 
                id: foundUser.id, 
                fname: foundUser.fname, 
                emid: foundUser.emid, 
                role: foundUser.role?.name 
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

/* ==================================
    2. REFRESH TOKEN (ต่ออายุอัตโนมัติ)
   ================================== */
router.post('/refresh', async (req, res) => {
    try {
        const rfToken = req.cookies.refresh_token;

        if (!rfToken) return res.status(401).json({ message: 'Session expired' });

        // ตรวจสอบใน DB ว่า Refresh Token นี้ยังใช้งานได้อยู่ไหม
        const savedSession = await session.findOne({ where: { refresh_token: rfToken } });
        if (!savedSession) return res.status(403).json({ message: 'Invalid session' });

        // Verify Token
        jwt.verify(rfToken, REFRESH_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Token invalid' });

            // สร้าง Access Token ใหม่
            const newAccessToken = jwt.sign(
                { userID: decoded.userID },
                JWT_SECRET,
                { expiresIn: '30m' }
            );

            res.cookie('auth_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 60 * 1000
            });

            res.json({ message: 'Token refreshed' });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* ==================================
    3. LOGOUT (ล้างทิ้งทั้งหมด)
   ================================== */
router.post('/logout', async (req, res) => {
    try {
        const rfToken = req.cookies.refresh_token;
        
        // ลบออกจาก DB
        if (rfToken) {
            await session.destroy({ where: { refresh_token: rfToken } });
        }

        // ล้าง Cookie ใน Browser
        res.clearCookie('auth_token');
        res.clearCookie('refresh_token');

        res.json({ message: 'Logout success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;