const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Simple CORS middleware for local development (adjust or remove in production)
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static files from Pages folder so your HTML is reachable
app.use(express.static(path.join(__dirname, '..')));

const SUBSCRIBERS_FILE = path.join(__dirname, 'subscribers.json');

function readSubscribers() {
  try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) return [];
    const raw = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read subscribers file', err);
    return [];
  }
}

function writeSubscribers(list) {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write subscribers file', err);
  }
}

// Create transporter using environment variables for security
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: use ethereal for testing or console log (no credentials)
  console.warn('SMTP credentials not set. Emails will be logged to console only.');
  return {
    sendMail: async (opts) => {
      console.log('--- mock sendMail ---');
      console.log(opts);
      return Promise.resolve({ accepted: [process.env.ADMIN_EMAIL || 'admin@example.com'] });
    },
  };
}

const transporter = createTransporter();

// Log transporter state and verify SMTP connection when possible
(async function verifyTransport() {
  try {
    if (transporter && typeof transporter.verify === 'function') {
      await transporter.verify();
      console.log('SMTP transporter verified: ready to send emails');
    } else {
      console.log('Using mock transporter (emails will be logged to console)');
    }
  } catch (err) {
    console.error('SMTP transporter verification failed:', err && err.message ? err.message : err);
  }
})();

// Endpoint to accept subscriptions
app.post('/subscribe', async (req, res) => {
  console.log('[/subscribe] incoming request', { ip: req.ip, headers: req.headers && req.headers['content-type'] });
  const { email } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const subscribers = readSubscribers();
  if (subscribers.includes(email)) {
    return res.status(200).json({ message: 'Already subscribed' });
  }

  subscribers.push(email);
  writeSubscribers(subscribers);

  // Send a confirmation email to subscriber and notify admin
  try {
    // confirmation to subscriber
    try {
      const infoSub = await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com',
        to: email,
        subject: 'Thanks for subscribing to Carl\'s Closet',
        text: `Thanks for subscribing to Carl's Closet updates. We'll keep you posted!`,
      });
      console.log('Confirmation email send result:', infoSub);
    } catch (err) {
      console.error('Failed to send confirmation email to subscriber:', err && err.message ? err.message : err);
    }

    // notification to admin
    try {
      const infoAdmin = await transporter.sendMail({
        from: process.env.FROM_EMAIL || process.env.SMTP_USER || 'no-reply@example.com',
        to: process.env.ADMIN_EMAIL || 'carlallenjr87@gmail.com',
        subject: 'New newsletter subscriber',
        text: `New subscriber: ${email}`,
      });
      console.log('Admin notification send result:', infoAdmin);
    } catch (err) {
      console.error('Failed to send admin notification email:', err && err.message ? err.message : err);
    }
  } catch (err) {
    console.error('Error sending notification emails:', err);
    // don't fail subscription if email sending fails
  }

  return res.status(200).json({ message: 'Subscribed' });
});

// Keep the old send-email endpoint (contact form) if needed
app.post('/send-email', async (req, res) => {
  console.log('[/send-email] incoming request', { ip: req.ip, headers: req.headers && req.headers['content-type'] });
  const { name, email, message } = req.body;
  try {
    await transporter.sendMail({
      from: email,
      to: process.env.ADMIN_EMAIL || 'carlallenjr87@gmail.com',
      subject: `New Contact Form Submission from ${name || 'visitor'}`,
      text: `You have a new message from ${name || 'visitor'} (${email || 'no-email'}):\n\n${message || ''}`,
    });
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Failed to send email.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Server debug:', { port: PORT, cwd: process.cwd(), dir: __dirname });
});

// Better global error visibility for debugging connection issues
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});