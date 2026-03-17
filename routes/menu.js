const express = require('express');
const router = express.Router();
// routes/menu.js หรือ controller
const { Menu, role } = require('../models'); 

router.get('/menus', async (req, res) => {
    try {
        const roleId = req.query.role;

        if (!roleId) {
            return res.status(400).json({ message: "Missing role parameter" });
        }

        // แก้ไขจุดนี้: เพิ่ม 'as' ให้ตรงกับที่นิยามไว้ใน models/role.js
        const menus = await Menu.findAll({
            include: [{
                model: role,
                as: 'roles', // <--- ต้องใส่ Alias ที่ตั้งไว้ใน Menu.associate
                where: { id: roleId },
                attributes: [],
                through: { attributes: [] }
            }],
            order: [['id', 'ASC']]
        });

        res.status(200).json(menus);

    } catch (error) {
        console.error("Fetch Menu Error:", error);
        res.status(500).json({ 
            message: "Internal Server Error",
            error: error.message 
        });
    }
});

module.exports = router;