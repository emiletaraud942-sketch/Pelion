// Envoi des demandes de contact par email via l'API Brevo.
// Variables Vercel : BREVO_API_KEY (clé API), CONTACT_TO (adresse qui reçoit), BREVO_SENDER (expéditeur validé dans Brevo, facultatif).
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, n) => String(v || '').trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false }); }
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.hp) return res.status(200).json({ ok: true }); // piège à robots : on fait semblant
  const name = clean(b.name, 120), company = clean(b.company, 160), email = clean(b.email, 200), message = clean(b.message, 4000);
  if (!name || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'invalid' });
  const key = process.env.BREVO_API_KEY, to = process.env.CONTACT_TO;
  if (!key || !to) return res.status(500).json({ ok: false, error: 'not_configured' });
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Site Pelion', email: process.env.BREVO_SENDER || to },
      to: [{ email: to }],
      replyTo: { email, name },
      subject: 'Nouvelle demande de contact : ' + company,
      htmlContent: `<p><b>Nom :</b> ${esc(name)}<br><b>Entreprise :</b> ${esc(company)}<br><b>Email :</b> ${esc(email)}</p><p>${esc(message || '(pas de message)').replace(/\n/g, '<br>')}</p>`
    })
  }).catch(() => null);
  if (r && !r.ok) { const t = (await r.text()).slice(0, 300); console.error('brevo', r.status, t); return res.status(502).json({ ok: false, error: 'send_failed', debug: r.status + ' ' + t }); }
  if (!r) return res.status(502).json({ ok: false, error: 'send_failed' });
  res.status(200).json({ ok: true });
};
