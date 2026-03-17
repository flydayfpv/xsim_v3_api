const express = require('express');
const router = express.Router();
const { client } = require('../models');

// --- Helper Function: สำหรับตรวจสอบ Format หรือความถูกต้องของ Key (ถ้ามี) ---
const isValidKeyFormat = (key) => {
    // ตัวอย่าง: ตรวจสอบว่าต้องเป็น XXXX-XXXX
    const regex = /^\w{4}-\w{4}$/;
    return regex.test(key);
};

/**
 * 1. CHECK: ตรวจสอบ License (ใช้ใน Process ตอนเริ่มแอป Python)
 * POST: /api/clients/check
 */
router.post('/check', async (req, res) => {
    try {
        const { hwid, license_key } = req.body;

        if (!hwid || !license_key) {
            return res.status(400).json({ message: 'HWID and License Key are required' });
        }

        // ค้นหาเครื่องที่มี HWID และ License Key ตรงกันใน Database
        const device = await client.findOne({
            where: {
                hw_id: hwid,
                license_key: license_key
            }
        });

        if (!device) {
            return res.status(401).json({ message: 'Invalid License or Device mismatch' });
        }

        // หากต้องการเช็ควันหมดอายุ (ถ้าใน Model มี field expired_at)
        // if (new Date() > device.expired_at) return res.status(403).json({ message: 'License expired' });

        res.json({ 
            status: 'success', 
            message: 'License is valid',
            computer_name: device.computer_name 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 2. REGISTER: ลงทะเบียนเครื่องใหม่
 * POST: /api/clients/register
 */
router.post('/register', async (req, res) => {
    try {
        const { computer_name, hwid, license_key } = req.body;

        // 1. ตรวจสอบฟิลด์ว่าง
        if (!computer_name || !hwid || !license_key) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 2. ตรวจสอบ Format ของ License Key (ถ้าต้องการ)
        if (!isValidKeyFormat(license_key)) {
            return res.status(400).json({ message: 'Invalid License Key format' });
        }

        // 3. ตรวจสอบว่า HWID นี้เคยลงทะเบียนไปหรือยัง
        const existingDevice = await client.findOne({ where: { hw_id: hwid } });
        if (existingDevice) {
            return res.status(400).json({ message: 'This device is already registered' });
        }

        // 4. บันทึกลง Database
        const newClient = await client.create({
            computer_name,
            hw_id: hwid,
            license_key
        });

        res.status(201).json({
            message: 'Registration successful',
            data: newClient
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ส่วน CRUD อื่นๆ สำหรับ Admin Panel ---

// READ ALL
router.get('/', async (req, res) => {
    try {
        const clients = await client.findAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const { computer_name, license_key } = req.body;
        const result = await client.update(
            { computer_name, license_key },
            { where: { id: req.params.id } }
        );
        if (result[0] === 0) return res.status(404).json({ message: 'Client not found' });
        res.json({ message: 'Updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const result = await client.destroy({ where: { id: req.params.id } });
        if (!result) return res.status(404).json({ message: 'Client not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;