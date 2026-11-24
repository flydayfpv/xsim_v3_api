const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 3131;

// --------------------
// 1. CORS Configuration
// --------------------
app.use(cors({
  // The origin must include the protocol (http://)
  origin: "*", 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Optional: Add this if you plan to use cookies/sessions
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
const cbt = require("./routes/cbt")

app.use("/auth", authRouter);
app.use("/itemCategory", itemCategory);
app.use("/itemImage", itemImage); // Suggest using /api prefix for consistency
app.use("/area", area); // Suggest using /api prefix for consistency
app.use("/baggage", baggage); // Suggest using /api prefix for consistency
app.use("/cbt",cbt)
app.use("/training", require("./routes/training")); // Training routes
app.use("/corrective", require("./routes/corrective")); // Corrective routes
app.use("/users", require("./routes/user")); // User routes
app.use("/correctivelog", require("./routes/correctivelog")); // Corrective Log routes
app.use("/appuse", require("./routes/appuse")); // App Use routes
app.use("/usercookies", require("./routes/UserCookies")); // User Cookies routes
app.use("/pagecomponents", require("./routes/pageComponents")); // Page Components routes
app.use("/client", require("./routes/client")); // Client routes
app.use("/menu", require("./routes/menu")); // Menu routes
// -------------------- 
// 6. Start Server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 