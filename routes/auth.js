const express = require('express');
const router = express.Router();
const { user, session } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { authSession } = require('../middleware');

const JWT_SECRET = process.env.JWT_SECRET;

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

    // 🔐 password check (ตัวอย่าง)
    // if (!bcrypt.compareSync(password, foundUser.password)) {
    //   return res.status(401).json({ message: 'Invalid password' });
    // }

    // 🔥 kill old sessions (login ซ้ำ = logoff เครื่องเก่า)
    await session.destroy({
      where: { userID: foundUser.id }
    });

    const accessToken = jwt.sign(
      { userID: foundUser.id, roleID: foundUser.roleID },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { userID: foundUser.id },
      process.env.JWT_SECRET,
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
    await req.session.destroy();
    res.json({ message: 'Logout success' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
