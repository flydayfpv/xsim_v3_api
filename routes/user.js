const express = require('express');
const router = express.Router();
const { user, role, division, LoginHistory } = require('../models');
const bcrypt = require('bcrypt');

/**
 * -----------------------------------------------------------------------
 * UTILITY FUNCTIONS
 * -----------------------------------------------------------------------
 */
const SALT_ROUNDS = 10;

/**
 * -----------------------------------------------------------------------
 * ROUTES
 * -----------------------------------------------------------------------
 */

// 1. GET USER BY EMID: สำหรับหน้า Search หรือตรวจสอบพนักงานก่อนดำเนินการ
router.get('/emid/:emid', async (req, res) => {
    try {
        const foundUser = await user.findOne({
            where: { emid: req.params.emid },
            attributes: ['id', 'fname', 'lname', 'emid'], 
            include: [
                { model: prefix, attributes: ['name'] },
                { model: division, attributes: ['name'] },
                { model: role, attributes: ['name'] }
            ]
        });

        if (!foundUser) {
            return res.status(404).json({ message: 'Employee ID not found' });
        }

        const userData = {
            id: foundUser.id,
            emid: foundUser.emid,
            name: `${foundUser.prefix?.name || ''}${foundUser.fname} ${foundUser.lname}`,
            division: foundUser.division?.name,
            role: foundUser.role?.name
        };

        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. READ ALL: รายชื่อผู้ใช้ทั้งหมด (ตัด Password ออกเพื่อความปลอดภัย)
router.get('/', async (req, res) => {
    try {
        const users = await user.findAll({
            attributes: { exclude: ['password'] }, 
            include: [
                { model: prefix },
                { model: division },
                { model: department },
                { model: role }
            ]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. READ ONE BY ID: ดึงข้อมูลรายบุคคล
router.get('/id/:id', async (req, res) => {
    try {
        const foundUser = await user.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [prefix, division, role]
        });
        
        if (!foundUser) return res.status(404).json({ message: 'User not found' });
        res.json(foundUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. CREATE: ลงทะเบียนผู้ใช้ใหม่ (พร้อม Hash Password)
router.post('/', async (req, res) => {
    try {
        const data = { ...req.body };
        
        // บังคับ Hash password ตั้งแต่สร้างตัวตน
        if (data.password) {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            data.password = await bcrypt.hash(data.password, salt);
        }

        const newUser = await user.create(data);
        const { password, ...userWithoutPassword } = newUser.toJSON();
        
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. UPDATE: อัปเดตข้อมูล หรือ เปลี่ยนรหัสผ่าน
router.post('/updatepassword/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };

        // 🔐 ถ้ามีการส่ง password มา (เช่นจากหน้า Force Change Password) ให้ Hash ใหม่
        if (updateData.password) {
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const [updatedRows] = await user.update(updateData, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) return res.status(404).json({ message: 'User not found or no changes made' });
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 6. DELETE: ลบผู้ใช้
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await user.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. CHECK DEFAULT PASSWORD: เช็คว่ายังใช้รหัสผ่าน "123456" อยู่หรือไม่
router.post('/checkdefaultpassword', async (req, res) => {
    try {
        const { id } = req.body; 
        if (!id) return res.status(400).json({ message: 'User ID is required' });

        const foundUser = await user.findByPk(id);
        if (!foundUser) return res.status(404).json({ message: 'User not found' });

        // ตรวจสอบกับค่าเริ่มต้น "123456"
        const isDefault = await bcrypt.compare('123456', foundUser.password);

        res.json({ 
            isDefault: isDefault, 
            message: isDefault ? 'Default password detected' : 'Password has been changed'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. GET LAST SESSION: ดึงข้อมูลโปรไฟล์และรูปภาพล่าสุดที่ใช้ Login
router.get('/lastsession/:id', async (req, res) => {
    try {
        const foundUser = await user.findOne({
            where: { id: req.params.id },
            attributes: ['id', 'fname', 'lname', 'emid'], 
            include: [
                { model: role, attributes: ['name'] },
                { model: division, attributes: ['name'] },
                { 
                    model: LoginHistory, 
                    as: 'loginHistories',
                    attributes: ['imagePath', 'loginAt'],
                    limit: 1, // เอาแค่รายการเดียว
                    order: [['loginAt', 'DESC']] // เรียงจากใหม่ไปเก่า
                }
            ]
        });

        if (!foundUser) return res.status(404).json({ message: 'User not found' });

        // ดึงข้อมูลการ Login ล่าสุดจาก Array (Sequelize จะคืนค่ามาเป็น Array แม้จะมี limit 1)
        const lastLoginRecord = foundUser.loginHistories && foundUser.loginHistories[0];

        const responseData = {
            id: foundUser.id,
            emid: foundUser.emid,
            fullName: `${foundUser.fname} ${foundUser.lname}`,
            role: foundUser.role?.name,
            division: foundUser.division?.name,
            loginAt: lastLoginRecord ? lastLoginRecord.loginAt : null,
            // URL สำหรับแสดงผลรูปภาพที่สแกนล่าสุด
            imageUrl: lastLoginRecord?.imagePath 
                ? `http://61.7.159.216:9000/uploads/logins/${lastLoginRecord.imagePath}` 
                : null
        };

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /dashboard-info/:id
// ดึงข้อมูลภาพล่าสุดจาก LoginHistory และรายละเอียดพื้นฐานจาก User
router.get('/dashboardinfo/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const foundUser = await user.findOne({
            where: { id: userId },
            attributes: ['id', 'fname', 'lname', 'emid'], // ดึงข้อมูลพื้นฐาน
            include: [
                { 
                    model: role, 
                    attributes: ['name'] 
                },
                { 
                    model: division, 
                    attributes: ['name'] 
                },
                { 
                    model: LoginHistory, 
                    as: 'loginHistories', // ต้องตรงกับ Alias ใน Model user.js
                    attributes: ['imagePath', 'loginAt', 'hwid'],
                    limit: 1, // เอาเฉพาะอันล่าสุด
                    order: [['loginAt', 'DESC']] // เรียงจากใหม่ไปเก่า
                }
            ]
        });

        if (!foundUser) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้ในระบบ' });
        }

        // ดึง Record ล่าสุดจาก Array (ถ้าไม่มีประวัติเลยจะเป็น undefined)
        const lastLogin = foundUser.loginHistories?.[0];

        // จัดรูปแบบข้อมูลให้ Frontend นำไปใช้ง่ายๆ
        const responseData = {
            id: foundUser.id,
            emid: foundUser.emid,
            fullName: `${foundUser.fname} ${foundUser.lname}`,
            role: foundUser.role?.name || 'Operator',
            division: foundUser.division?.name || 'N/A',
            lastLoginAt: lastLogin ? lastLogin.loginAt : null,
            // รวม Path รูปภาพให้เรียบร้อย
            imageUrl: lastLogin?.imagePath 
                ? `http://61.7.159.216:9000/xsim3_api/${lastLogin.imagePath}` 
                : null
        };

        res.json(responseData);
    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;