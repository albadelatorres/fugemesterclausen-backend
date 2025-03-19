// server.js
const express = require("express");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(bodyParser.json());

// Middleware para CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Cambia * por tu dominio para mayor seguridad
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.post("/contact", async (req, res) => {
  const { navn, email, telefon, postnummer, besked } = req.body;
  const msg = {
    personalizations: [
      {
        to: [{ email }],
        cc: [{ email: process.env.SENDGRID_FROM_EMAIL }],
        subject: "Vi har modtaget din besked",
      },
    ],
    from: process.env.SENDGRID_FROM_EMAIL,
    text: `Hej ${navn},

Vi har modtaget din besked og vil kontakte dig snarest. Tak for din interesse i Fugemester Clausen!

Her er en kopi af de oplysninger, du har indsendt:
Navn: ${navn}
Email: ${email}
Telefon: ${telefon}
Postnummer: ${postnummer}
Besked: ${besked}

Med venlig hilsen,
Daniel`,
    html: `<p>Hej ${navn},</p>
           <p>Vi har modtaget din besked og vil kontakte dig snarest. Tak for din interesse i <strong>Fugemester Clausen</strong>!</p>
           <p>Her er en kopi af de oplysninger, du har indsendt:</p>
           <ul>
             <li><strong>Navn:</strong> ${navn}</li>
             <li><strong>Email:</strong> ${email}</li>
             <li><strong>Telefon:</strong> ${telefon}</li>
             <li><strong>Postnummer:</strong> ${postnummer}</li>
             <li><strong>Besked:</strong> ${besked}</li>
           </ul>
           <p>Med venlig hilsen,<br/>Daniel</p>`
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ error: "Error sending email" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));