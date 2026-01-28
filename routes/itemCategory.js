'use strict';

const express = require('express');
const router = express.Router();
const { itemCategory, baggage, area, Sequelize } = require('../models'); 

// 🎯 API สำหรับดึงสถิติจำนวนภาพแยกตามหมวดหมู่ และชื่อ Area
// URL: http://localhost:3015/itemCategory/getCategoryCountByArea?areaID=1
router.get('/getCategoryCountByArea', async (req, res) => {
  try {
    const { areaID } = req.query;

    if (!areaID) {
      return res.status(400).json({ message: 'areaID is required' });
    }

    // 1. ดึงข้อมูล Area (เพื่อเอาชื่อมาแสดงที่หัวเว็บ)
    const currentArea = await area.findByPk(areaID, {
      attributes: ['name']
    });

    // 2. ดึงสถิติหมวดหมู่ พร้อมนับจำนวน baggage ที่อยู่ในพื้นที่นั้นๆ
    const categoryStats = await itemCategory.findAll({
      attributes: [
        'id', 
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('baggages.id')), 'baggageCount']
      ],
      include: [{
        model: baggage,
        as: 'baggages',
        attributes: [],
        where: { areaID: areaID },
        required: false // Left Join เพื่อให้หมวดหมู่ที่ไม่มีรูปเลยยังแสดงผลเป็น 0
      }],
      group: ['itemCategory.id', 'itemCategory.name'],
      order: [['id', 'ASC']]
    });

    // 3. รวมข้อมูลส่งกลับเป็น Object ชุดเดียว
    res.json({
      areaName: currentArea ? currentArea.name : `Area ${areaID}`,
      categories: categoryStats
    });

  } catch (error) {
    console.error('Error in getCategoryCountByArea:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ดึงรายการหมวดหมู่แบบธรรมดา
router.get('/', async (req, res) => {
  try {
    const categories = await itemCategory.findAll({ order: [['id', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;