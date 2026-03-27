import { Resend } from 'resend';
import { DigestStats } from './digest';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(name: string, summary: string, weekOf: string, appUrl: string, stats: DigestStats): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Prism Review</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Inter', 'Segoe UI', Arial, sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo & Header -->
          <tr>
            <td style="text-align:center;padding-bottom:30px;">
              <div style="display:inline-block;background:linear-gradient(90deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:1.5rem;font-weight:800;letter-spacing:-0.5px;margin-bottom:12px;">✦ Prism</div>
              <h1 style="margin:0;font-size:2rem;font-weight:700;color:#f8fafc;">Your Weekly <span style="background:linear-gradient(90deg,#fbbf24,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Prism</span> review</h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:1rem;font-weight:500;">${weekOf}</p>
            </td>
          </tr>

          <!-- View Hub Button (Top) -->
          <tr>
            <td style="text-align:center;padding-bottom:40px;">
              <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#ffffff;text-decoration:none;font-weight:600;font-size:0.9rem;padding:12px 28px;border-radius:30px;">
                View your insights hub
              </a>
            </td>
          </tr>

          <!-- Card 1: Time Saved (Pink/Purple) -->
          <tr>
            <td style="padding-bottom:24px;">
              <div style="background:linear-gradient(180deg, rgba(236,72,153,0.08), rgba(168,85,247,0.15));border:1px solid rgba(236,72,153,0.2);border-radius:24px;padding:48px 32px;text-align:center;">
                <h2 style="margin:0 0 16px;color:#f472b6;font-size:1.3rem;font-weight:600;letter-spacing:-0.02em;">You saved</h2>
                <div style="font-size:4.5rem;font-weight:800;color:#ffffff;line-height:1;margin-bottom:16px;">${stats.hoursSaved}</div>
                <h3 style="margin:0 0 24px;color:#f8fafc;font-size:1.4rem;font-weight:500;">hours searching</h3>
                <p style="margin:0;color:#cbd5e1;font-size:0.95rem;line-height:1.6;max-width:400px;margin:0 auto;">
                  Working without AI search adds up. Instead of digging manually through multiple apps, you found answers instantly with <span style="color:#f472b6;font-weight:600;">Prism</span>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Card 2: Items Surfaced (Blue) -->
          <tr>
            <td style="padding-bottom:24px;">
              <div style="background:linear-gradient(180deg, rgba(59,130,246,0.08), rgba(99,102,241,0.15));border:1px solid rgba(59,130,246,0.2);border-radius:24px;padding:48px 32px;text-align:center;">
                <div style="display:inline-block;margin-bottom:16px;font-size:0.75rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#93c5fd;border:1px solid rgba(147,197,253,0.3);padding:4px 12px;border-radius:20px;">
                  📍 YOUR KNOWLEDGE
                </div>
                <h2 style="margin:0 0 16px;color:#60a5fa;font-size:1.3rem;font-weight:600;">Prism surfaced</h2>
                <div style="font-size:4.5rem;font-weight:800;color:#ffffff;line-height:1;margin-bottom:16px;">${stats.itemsSurfaced}</div>
                <h3 style="margin:0 0 24px;color:#f8fafc;font-size:1.4rem;font-weight:500;">documents & messages</h3>
                <p style="margin:0;color:#cbd5e1;font-size:0.95rem;line-height:1.6;max-width:400px;margin:0 auto;">
                  Prism scanned across your integrations to bring you the exact context you needed, without switching tabs.
                </p>
              </div>
            </td>
          </tr>

          <!-- Card 3: Top Integration (Emerald) -->
          <tr>
            <td style="padding-bottom:24px;">
              <div style="background:linear-gradient(180deg, rgba(16,185,129,0.08), rgba(20,184,166,0.15));border:1px solid rgba(16,185,129,0.2);border-radius:24px;padding:48px 32px;text-align:center;">
                <h2 style="margin:0 0 16px;color:#34d399;font-size:1.3rem;font-weight:600;">Your top integration</h2>
                <div style="font-size:3.5rem;font-weight:800;color:#ffffff;line-height:1.2;margin-bottom:16px;">${stats.topIntegration}</div>
                <p style="margin:0;color:#cbd5e1;font-size:0.95rem;line-height:1.6;max-width:400px;margin:0 auto;border-top:1px solid rgba(52,211,153,0.2);padding-top:24px;">
                  You currently have <span style="color:#34d399;font-weight:700;">${stats.totalIntegrations}</span> apps connected.<br>
                  <a href="${appUrl}/account" style="color:#6ee7b7;text-decoration:none;font-weight:600;font-size:0.9rem;display:inline-block;margin-top:12px;">Connect more apps ➔</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Card 4: AI Summary (Deep Purple) -->
          <tr>
            <td style="padding-bottom:40px;">
              <div style="background:linear-gradient(180deg, rgba(139,92,246,0.08), rgba(124,58,237,0.15));border:1px solid rgba(139,92,246,0.2);border-radius:24px;padding:40px 32px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <span style="display:inline-block;font-size:1.5rem;margin-bottom:12px;">✨</span>
                  <h2 style="margin:0;color:#a78bfa;font-size:1.2rem;font-weight:600;letter-spacing:-0.02em;">Team Activity Summary</h2>
                </div>
                <div style="background:rgba(0,0,0,0.2);border-radius:16px;padding:24px;border:1px solid rgba(139,92,246,0.1);">
                  <p style="margin:0;color:#f1f5f9;font-size:1rem;line-height:1.8;">
                    ${summary}
                  </p>
                </div>
              </div>
            </td>
          </tr>

          <!-- View Hub Button (Bottom) -->
          <tr>
            <td style="text-align:center;padding-bottom:40px;">
              <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#ffffff;text-decoration:none;font-weight:600;font-size:0.95rem;padding:14px 32px;border-radius:30px;">
                View your insights hub
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:32px;">
              <p style="margin:0 0 12px;font-size:0.75rem;color:#64748b;">
                You're receiving these insights because you use Prism.<br>
                To change your preferences, <a href="${appUrl}/account" style="color:#94a3b8;text-decoration:underline;">update your settings here</a>.
              </p>
              <div style="color:#475569;font-weight:600;letter-spacing:1px;font-size:0.7rem;margin-top:20px;">
                © 2026 PRISM INC.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendDigestEmail(
    to: string,
    name: string,
    summary: string,
    weekOf: string,
    stats: DigestStats
): Promise<boolean> {
    const appUrl = process.env.APP_URL || 'https://prism.vercel.app';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Prism <onboarding@resend.dev>';

    try {
        const { error } = await resend.emails.send({
            from: fromEmail,
            to,
            subject: `✦ Your Weekly Prism Review — ${weekOf}`,
            html: buildEmailHtml(name || 'there', summary, weekOf, appUrl, stats),
        });

        if (error) {
            console.error(`Failed to send digest to ${to}:`, error);
            return false;
        }

        console.log(`Digest sent to ${to}`);
        return true;
    } catch (err: any) {
        console.error(`Error sending digest to ${to}:`, err?.message);
        return false;
    }
}
