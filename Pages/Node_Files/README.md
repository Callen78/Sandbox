Run the newsletter server

1. Install dependencies

   npm install express body-parser nodemailer

2. Copy `.env.example` to `.env` and fill values (or set environment variables).

3. Start the server

   node server.js

The server serves static files from the parent `Pages` folder, exposing your HTML. It provides:

- POST /subscribe  -> accepts { email } JSON and saves to `subscribers.json`, sends confirmation and admin notification.
- POST /send-email -> existing contact form handler.

For production use, set SMTP_* environment variables and a secure From address. Consider using a dedicated email provider (SendGrid, Mailgun) for larger lists and handling unsubscribes, double opt-in, and GDPR compliance.
