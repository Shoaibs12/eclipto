# Eclipto website

An immersive, scroll-led company website built from the Eclipto 2026–27 service catalogue and pricing pack.

## Preview

Open `index.html` directly, or run any static server in this directory:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Structure

- `index.html` — content and semantic page structure
- `styles.css` — responsive design system, layouts and motion
- `script.js` — scroll reveals, canvas field, cursor and interactive details
- `assets/eclipto-blue-logo.jpeg` — current Eclipto blue identity supplied by the client
- `assets/eclipto-wordmark.png` — optimized complete logo used in navigation and contact areas
- `api/contact.js` — validated, rate-limited server-side contact endpoint for Vercel
- `vercel.json` — production security and caching headers

The email and phone links are configured for `eclipto.in@gmail.com` and `+91 77208 35581`.

## Vercel contact form

Copy `.env.example` into your Vercel project environment variables and provide:

- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` using a domain verified in Resend
- `CONTACT_TO_EMAIL` (defaults to `eclipto.in@gmail.com`)

The API key stays server-side and is never exposed to website visitors.
