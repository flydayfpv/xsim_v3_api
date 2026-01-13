const express = require("express");
const app = express();
const PORT = 3018;

// middleware
app.use(express.json());

// test API
app.get("/", (req, res) => {
  res.json({ message: "Express API is running" });
});

// GET
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello World" });
});

// POST
app.post("/api/echo", (req, res) => {
  res.json({
    you_sent: req.body
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
