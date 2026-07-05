/**
 * /api/accept-proposal — Vercel Serverless Function
 *
 * Receives a proposal acceptance from the digital proposal page,
 * emails Jeff at jeff@hextalent.com.au with the details, and returns
 * a JSON success/error to the client.
 *
 * Env vars (set in Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   — Resend API key (already used by Sunny Stories)
 *   ACCEPT_TO_EMAIL  — optional override, defaults to jeff@hextalent.com.au
 *   ACCEPT_FROM      — optional override, defaults to "HeXTalent Proposals
 *                       <acceptances@hextalent.com.au>"  (must be verified
 *                       in Resend; falls back to onboarding@resend.dev for
 *                       initial testing before domain verification)
 */

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

const isEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

module.exports = async (req, res) => {
  // CORS not strictly needed (same origin) but useful for dev
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let payload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const name = String(payload.name || '').trim();
  const position = String(payload.position || '').trim();
  const email = String(payload.email || '').trim();
  const company = String(payload.company || '').trim();
  const agree = !!payload.agree;
  const proposalRef = String(payload.proposalRef || '').trim();
  const clientRef = String(payload.clientRef || '').trim();
  const acceptedAt = String(payload.acceptedAt || new Date().toISOString());

  // Basic validation
  if (!name || !position || !company) {
    return res.status(400).json({ error: 'Missing required fields (name, position, company).' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!agree) {
    return res.status(400).json({ error: 'Acceptance confirmation is required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY environment variable');
    return res.status(500).json({
      error: 'The acceptance service is not fully configured. Please email jeff@hextalent.com.au to accept.'
    });
  }

  // Capture basic request context for the audit trail
  const forwardedFor = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = forwardedFor || req.socket?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  const toEmail = process.env.ACCEPT_TO_EMAIL || 'jeff@hextalent.com.au';
  const fromEmail = process.env.ACCEPT_FROM || 'HeXTalent Proposals <acceptances@hextalent.com.au>';

  const subject = `[Proposal accepted] ${clientRef || company} — ${proposalRef || 'HeXTalent proposal'}`;

  const bodyLines = [
    `A proposal has been accepted electronically via hextalent.com.au.`,
    ``,
    `— Signatory —`,
    `Name:      ${name}`,
    `Position:  ${position}`,
    `Email:     ${email}`,
    `Company:   ${company}`,
    ``,
    `— Proposal —`,
    `Reference: ${proposalRef || '(none)'}`,
    `Client:    ${clientRef || '(none)'}`,
    `Accepted:  ${acceptedAt}`,
    ``,
    `— Audit —`,
    `IP:        ${ip}`,
    `User-Agent: ${userAgent}`,
    ``,
    `Signatory has confirmed authority to bind the Company named above`,
    `and accepted the Terms of Business. Electronic acceptance under the`,
    `Electronic Transactions Act 1999 (Cth).`,
  ];
  const textBody = bodyLines.join('\n');

  const htmlBody = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#14181f;line-height:1.55">
      <h2 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:24px;margin:0 0 8px;color:#0a0c10">Proposal accepted</h2>
      <p style="color:#4a4d55;margin:0 0 24px">A proposal has been accepted electronically via hextalent.com.au.</p>

      <h3 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5a9fbe;border-bottom:1px solid #d8d3c8;padding-bottom:4px;margin:0 0 12px">Signatory</h3>
      <table style="border-collapse:collapse;font-size:14px;margin:0 0 24px">
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Name</td><td style="padding:4px 0;color:#14181f;font-weight:500">${escapeHtml(name)}</td></tr>
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Position</td><td style="padding:4px 0;color:#14181f;font-weight:500">${escapeHtml(position)}</td></tr>
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Email</td><td style="padding:4px 0;color:#14181f;font-weight:500">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Company</td><td style="padding:4px 0;color:#14181f;font-weight:500">${escapeHtml(company)}</td></tr>
      </table>

      <h3 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5a9fbe;border-bottom:1px solid #d8d3c8;padding-bottom:4px;margin:0 0 12px">Proposal</h3>
      <table style="border-collapse:collapse;font-size:14px;margin:0 0 24px">
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Reference</td><td style="padding:4px 0;color:#14181f">${escapeHtml(proposalRef) || '(none)'}</td></tr>
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Client</td><td style="padding:4px 0;color:#14181f">${escapeHtml(clientRef) || '(none)'}</td></tr>
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">Accepted at</td><td style="padding:4px 0;color:#14181f;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">${escapeHtml(acceptedAt)}</td></tr>
      </table>

      <h3 style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#5a9fbe;border-bottom:1px solid #d8d3c8;padding-bottom:4px;margin:0 0 12px">Audit</h3>
      <table style="border-collapse:collapse;font-size:13px;color:#4a4d55;margin:0 0 24px">
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84">IP</td><td style="padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace">${escapeHtml(ip)}</td></tr>
        <tr><td style="padding:4px 24px 4px 0;color:#7a7d84;vertical-align:top">User-Agent</td><td style="padding:4px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;max-width:420px;word-break:break-all">${escapeHtml(userAgent)}</td></tr>
      </table>

      <p style="font-size:12px;color:#7a7d84;border-top:1px solid #d8d3c8;padding-top:12px;margin:24px 0 0">
        Signatory has confirmed authority to bind the Company named above and accepted the Terms of Business. Electronic acceptance under the <em>Electronic Transactions Act 1999</em> (Cth).
      </p>
    </div>`;

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text().catch(() => '');
      console.error('Resend send failed', resendRes.status, errText);
      return res.status(502).json({ error: 'Email delivery failed. Please email jeff@hextalent.com.au to accept.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('accept-proposal error', err);
    return res.status(500).json({ error: 'Unexpected server error. Please email jeff@hextalent.com.au to accept.' });
  }
};
