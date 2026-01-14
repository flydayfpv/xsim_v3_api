const jwt = require('jsonwebtoken');
const { session } = require('./models'); // ปรับ path ตามโปรเจกต์
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.authSession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const activeSession = await session.findOne({
      where: {
        userID: decoded.userID,
        expires_at: { [Op.gt]: new Date() }
      }
    });

    if (!activeSession) {
      return res.status(401).json({ message: 'Session expired or logged out' });
    }

    // update last active
    await activeSession.update({
      last_active_at: new Date()
    });

    req.user = decoded;
    req.session = activeSession;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
