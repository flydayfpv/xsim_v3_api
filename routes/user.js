const express = require('express');
const router = express.Router();
const { user, prefix, division, department, role } = require('../models');

// 1. GET USER BY EMID: Used by your frontend search box
router.get('/emid/:emid', async (req, res) => {
    try {
        const foundUser = await user.findOne({
            where: { emid: req.params.emid },
            // Including associations gives the frontend full names/roles
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
            return res.status(404).json({ message: 'Employee ID not found' });
        }

        // Combining fname and lname for the frontend "User Found" display
        const userData = {
            id: foundUser.id,
            name: `${foundUser.fname} ${foundUser.lname}`,
            division: foundUser.division?.name,
            role: foundUser.role?.name
        };

        res.json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. READ ALL: List all users
router.get('/', async (req, res) => {
    try {
        const users = await user.findAll({
            attributes: { exclude: ['password'] }, // Security: Never send passwords
            include: [prefix, division, department, role]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. CREATE: Register a new user
router.post('/', async (req, res) => {
    try {
        // In a real app, hash the password here before saving!
        const newUser = await user.create(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 4. UPDATE: Update user profile or lastLogin
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await user.update(req.body, {
            where: { id: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 5. DELETE: Remove user
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await user.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;