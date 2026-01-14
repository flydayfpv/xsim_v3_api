const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = 3020;

// ให้ req.ip ถูกต้อง
app.set('trust proxy', true);

// --------------------
// middleware
// --------------------
app.use(cors({
  origin: "*",
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------
// test API
// --------------------
app.get("/", (req, res) => {
  res.json({ message: "Express API is running" });
});

// --------------------
// routes
// --------------------
const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

// --------------------
// start server
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
