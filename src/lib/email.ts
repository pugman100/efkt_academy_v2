import 'server-only';
import { db } from './db';

type Mail = { to: string; subject: string; text: string; html?: string };

function escape(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

/** Simple branded HTML wrapper: navy text, one coral button. */
export function mailLayout(opts: { heading: string; body: string[]; cta?: { label: string; url: string }; footer?: string }) {
  const paras = opts.body.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#373B54">${escape(p)}</p>`).join('');
  const cta = opts.cta
    ? `<p style="margin:32px 0"><a href="${escape(opts.cta.url)}" style="display:inline-block;background:#F1554C;color:#fff;font-weight:700;text-decoration:none;padding:15px 32px;border-radius:999px;font-size:16px">${escape(opts.cta.label)}</a></p>
       <p style="margin:0 0 16px;font-size:14px;color:#63667E">Fungerer ikke knappen? Kopier lenken: <br>${escape(opts.cta.url)}</p>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#F8F8FA;font-family:'Be Vietnam Pro',-apple-system,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px">
    <div style="background:#fff;border:1px solid #E9E9EC;border-radius:20px;padding:40px">
      <h1 style="margin:0 0 24px;font-size:28px;line-height:1.2;font-weight:800;color:#373B54;letter-spacing:-0.03em">${escape(opts.heading)}</h1>
      ${paras}${cta}
    </div>
    <p style="margin:24px 0 0;font-size:14px;color:#63667E;text-align:center">${escape(opts.footer ?? 'EFKT Academy')}</p>
  </div></body></html>`;
}

/**
 * Sends through Resend when RESEND_API_KEY is set; otherwise logs to the console.
 * Every message is recorded in EmailOutbox either way.
 */
export async function sendMail(mail: Mail) {
  const row = await db.emailOutbox.create({
    data: { to: mail.to, subject: mail.subject, text: mail.text, html: mail.html ?? '' },
  });
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[email] to=${mail.to} subject="${mail.subject}"\n${mail.text}\n`);
    await db.emailOutbox.update({ where: { id: row.id }, data: { status: 'logged', sentAt: new Date() } });
    return { ok: true, logged: true };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'EFKT Academy <academy@efkt.com>',
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    await db.emailOutbox.update({ where: { id: row.id }, data: { status: 'sent', sentAt: new Date() } });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error('[email] failed', error);
    await db.emailOutbox.update({ where: { id: row.id }, data: { status: 'failed', error } });
    return { ok: false, error };
  }
}
