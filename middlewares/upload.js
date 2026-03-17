'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ตรวจสอบและสร้างโฟลเดอร์เก็บไฟล์อัตโนมัติ
const uploadDir = 'uploads/item-images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // ใช้ Date.now() ผสมกับสุ่มตัวเลข เพื่อป้องกันชื่อซ้ำหากมีการอัปโหลดพร้อมกันหลายไฟล์
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { 
        fileSize: 20 * 1024 * 1024 // ปรับเป็น 10MB เพื่อรองรับไฟล์ภาพความละเอียดสูง
    },
    fileFilter: (req, file, cb) => {
        // ตรวจสอบนามสกุลไฟล์ที่อนุญาต
        const allowedTypes = /jpeg|jpg|png|webp/;
        const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const isMimeValid = allowedTypes.test(file.mimetype);

        if (isExtValid && isMimeValid) {
            return cb(null, true);
        }
        cb(new Error('รูปแบบไฟล์ไม่ถูกต้อง! อนุญาตเฉพาะ .jpg, .jpeg, .png และ .webp เท่านั้น'));
    }
});

module.exports = upload;