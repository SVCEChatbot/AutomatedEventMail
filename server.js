const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
let bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(express.json());


const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

app.get("/",(req,res)=>{
  res.json({status:"success"});
})

app.post("/api/sendMail", async (req, res) => {
  const { to, content, subject, cc, attachments } = req.body;

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_ID,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  await transporter.sendMail({
    subject,
    text: `${content}\n\nRegards,\nTeam - SVCE ChatBot & BookMyEvent`,
    to,
    cc,
    from: process.env.EMAIL_ID,
    attachments
  });

  res.json({ status: "success" });
});

app.listen(8090, () => {});
