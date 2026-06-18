const requests = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

function clean(value, maxLength) {
  return String(value ?? "").trim().replace(/[\u0000-\u001F\u007F]/g, "").slice(0, maxLength);
}

function sameOrigin(request) {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  requests.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!sameOrigin(request)) {
    return response.status(403).json({ error: "Invalid request origin." });
  }

  const contentLength = Number(request.headers["content-length"] || 0);
  if (contentLength > 20_000) {
    return response.status(413).json({ error: "Request is too large." });
  }

  const ip = clean(request.headers["x-forwarded-for"]?.split(",")[0] || "unknown", 80);
  if (rateLimited(ip)) {
    return response.status(429).json({ error: "Too many messages. Please try again later." });
  }

  const name = clean(request.body?.name, 80);
  const email = clean(request.body?.email, 160).toLowerCase();
  const service = clean(request.body?.service, 120);
  const budget = clean(request.body?.budget, 80);
  const message = clean(request.body?.message, 3000);
  const website = clean(request.body?.website, 200);

  if (website) return response.status(200).json({ ok: true });
  if (name.length < 2 || message.length < 20 || !service || !budget) {
    return response.status(400).json({ error: "Please complete every field." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return response.status(400).json({ error: "Please enter a valid email address." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "eclipto.in@gmail.com";
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !from) {
    return response.status(503).json({ error: "The contact service is not configured yet." });
  }

  const text = [
    "New Eclipto project inquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Service: ${service}`,
    `Budget: ${budget}`,
    "",
    "Project details:",
    message
  ].join("\n");

  try {
    const mailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New Eclipto inquiry — ${service}`,
        text
      })
    });

    if (!mailResponse.ok) throw new Error("Email provider rejected the request.");
    return response.status(200).json({ ok: true });
  } catch {
    return response.status(502).json({ error: "Message delivery failed. Please try again." });
  }
};
