const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 NEW SERVER FILE LOADED");

// 🔥 test route
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

// 🔥 email route
app.post("/api/send-email", async (req, res) => {
  const { email, username, password } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "<company_email>", // 🔴 change this
      pass: "auth_password", // 🔴 change this
    },
  });

  try {
    await transporter.sendMail({
      from: "<sender_email>",
      to: email,
      subject: "Welcome to Konzeptes 🎓",
      html: `
        <h2>Welcome to Konzeptes</h2>
        <p>Your account has been created successfully.</p>
        <p><b>Username:</b> ${username}</p>
        <p><b>Password:</b> ${password}</p>
        <br/>
        <p>Please reset your password on your first login. 😊 </p>
      `,
    });

    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.json({ status: "error", message: "Email failed" });
  }
});

// 🔥 run server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
app.get("/api/send-email", (req, res) => {
  console.log("✅ GET /api/send-email hit");
  res.send("Email API is working ✅");
});
