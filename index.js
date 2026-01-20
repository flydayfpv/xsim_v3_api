const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 3015;

// --------------------
// 1. CORS Configuration
// --------------------
// It is better to place CORS at the very top
app.use(cors({
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --------------------
// 2. Static Files with CORS Headers (CRITICAL FOR CANVAS)
// --------------------
// We add a middleware specifically for /uploads to allow Canvas pixel manipulation
app.use('/uploads', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// --------------------
// 3. General Middleware
// --------------------
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------
// 4. Test API
// --------------------
app.get("/", (req, res) => {
  res.json({ message: "Express API is running" });
});

// --------------------
// 5. Routes
// --------------------
const authRouter = require("./routes/auth");
const itemCategory = require("./routes/itemCategory");
const itemImage = require("./routes/itemimage");
const area = require("./routes/area")
const baggage = require("./routes/baggage")

app.use("/auth", authRouter);
app.use("/itemCategory", itemCategory);
app.use("/itemImage", itemImage); // Suggest using /api prefix for consistency
app.use("/area", area); // Suggest using /api prefix for consistency
app.use("/baggage", baggage); // Suggest using /api prefix for consistency



// --------------------
// 6. Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});