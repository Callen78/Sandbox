# Copilot Instructions for Carl's Closet

## Project Overview
Carl's Closet is a clothing e-commerce website with static HTML/CSS/JS frontend and Node.js Express backend for newsletter subscriptions and contact forms.

## Architecture
- **Frontend**: Static files in `Pages/` directory (HTML, CSS, JS)
- **Backend**: Express server in `Pages/Node_Files/` serves static files from parent `Pages/` directory
- **Data Storage**: Subscribers stored in `Pages/Node_Files/subscribers.json` as simple JSON array
- **Email**: Nodemailer integration for confirmations and notifications

## Key Components
- `server.js`: Main server with `/subscribe` (POST) and `/send-email` (POST) endpoints
- `subscribers.json`: Email list storage
- Static HTML pages link to each other with relative paths (e.g., `../Child_Pages/Upper_Clothing.html`)

## Development Workflow
1. Install dependencies: `cd Pages/Node_Files && npm install`
2. Configure email: Copy `.env.example` to `.env`, set SMTP_HOST, SMTP_USER, SMTP_PASS, etc.
3. Start server: `cd Pages/Node_Files && node server.js`
4. Access at http://localhost:3000 (serves Pages/HomePage/Homepage.html as root)

## Patterns & Conventions
- **Email Handling**: Use try-catch blocks for each email send (confirmation + admin notification); don't fail subscription if email fails
- **CORS**: Configured for localhost:3000/5500 in development
- **Environment**: dotenv optional; falls back to console logging if no SMTP credentials
- **Data Persistence**: Simple JSON file read/write with fs; no database
- **Error Handling**: Log errors but continue processing (e.g., email failures don't block responses)
- **Paths**: Server uses `path.join(__dirname, '..')` to serve static from Pages/; HTML uses relative paths like `../Images/logo.jpg`

## Integration Points
- **Nodemailer**: Requires SMTP credentials; uses ethereal fallback for testing
- **Static Serving**: Express.static serves entire Pages/ directory
- **Form Handling**: body-parser for JSON and urlencoded data

## Common Tasks
- Add new page: Create HTML/CSS in appropriate subfolder, link from navigation
- Modify newsletter: Update email templates in server.js sendMail calls
- Debug email: Check server-log.txt or console for nodemailer output
- Add features: Extend server.js endpoints or add client-side JS in Node_Files/

## Dependencies
- express: Web server
- body-parser: Request parsing
- nodemailer: Email sending
- dotenv: Environment variables</content>
<parameter name="filePath">c:\Users\AIain\OneDrive\Desktop\My_Repos\Sandbox\.github\copilot-instructions.md