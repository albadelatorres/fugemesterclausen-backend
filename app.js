// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(bodyParser.json());

// Middleware para CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.post("/contact", async (req, res) => {
  const { navn, email, telefon, postnummer, besked } = req.body;

  const from = process.env.MAIL_FROM;
  const ownerEmail = process.env.MAIL_OWNER_EMAIL;

  if (!process.env.RESEND_API_KEY || !from || !ownerEmail) {
    console.error("Missing env vars: RESEND_API_KEY / MAIL_FROM / MAIL_OWNER_EMAIL");
    return res.status(500).json({ error: "Email service not configured" });
  }

  const userSubject = "Vi har modtaget din besked";
  const userText = `Hej ${navn},

Vi har modtaget din besked og vil kontakte dig snarest. Tak for din interesse i Fugemester Clausen!

Her er en kopi af de oplysninger, du har indsendt:
Navn: ${navn}
Email: ${email}
Telefon: ${telefon}
Postnummer: ${postnummer}
Besked: ${besked}

Med venlig hilsen,
Daniel`;

  const userHtml = `<p>Hej ${navn},</p>
           <p>Vi har modtaget din besked og vil kontakte dig snarest. Tak for din interesse i <strong>Fugemester Clausen</strong>!</p>
           <p>Her er en kopi af de oplysninger, du har indsendt:</p>
           <ul>
             <li><strong>Navn:</strong> ${navn}</li>
             <li><strong>Email:</strong> ${email}</li>
             <li><strong>Telefon:</strong> ${telefon}</li>
             <li><strong>Postnummer:</strong> ${postnummer}</li>
             <li><strong>Besked:</strong> ${besked}</li>
           </ul>
           <p>Med venlig hilsen,<br/>Daniel</p>`;

  const ownerSubject = "Ny besked fra kontaktformular";
  const ownerText = `Ny besked fra kontaktformularen:\n\nNavn: ${navn}\nEmail: ${email}\nTelefon: ${telefon}\nPostnummer: ${postnummer}\nBesked: ${besked}`;

  try {
    // 1) Auto-reply to the user
    await resend.emails.send({
      from,
      to: email,
      subject: userSubject,
      text: userText,
      html: userHtml,
    });

    // 2) Notification to you/owner (so you always get the lead even if the user's email bounces)
    await resend.emails.send({
      from,
      to: ownerEmail,
      subject: ownerSubject,
      text: ownerText,
    });

    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Resend error:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));