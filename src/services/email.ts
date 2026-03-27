import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHtml(name: string, summary: string, weekOf: string, appUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly Prism Digest</title>
</head>
<body style="margin:0;padding:0;background:#0f0f13;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:12px;padding:2px;">
                <div style="background:#0f0f13;border-radius:11px;padding:10px 24px;">
                  <span style="font-size:1.4rem;font-weight:800;background:linear-gradient(90deg,#a78bfa,#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.5px;">✦ Prism</span>
                </div>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#1a1a24;border:1px solid rgba(139,92,246,0.2);border-radius:20px;overflow:hidden;">

              <!-- Top accent bar -->
              <tr>
                <td style="height:3px;background:linear-gradient(90deg,#7c3aed,#3b82f6);display:block;"></td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px;">

                  <!-- Greeting -->
                  <p style="margin:0 0 8px;font-size:0.85rem;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Weekly Digest · ${weekOf}</p>
                  <h1 style="margin:0 0 24px;font-size:1.6rem;font-weight:700;color:#f1f5f9;line-height:1.3;">
                    Hey ${name}, here's what happened this week 👋
                  </h1>

                  <!-- Divider -->
                  <div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:24px;"></div>

                  <!-- AI Summary section -->
                  <div style="background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(59,130,246,0.06));border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:24px;margin-bottom:32px;">
                    <div style="display:flex;align-items:center;margin-bottom:12px;">
                      <span style="font-size:1rem;margin-right:8px;">✨</span>
                      <span style="font-size:0.72rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#a78bfa;">Prism AI Summary</span>
                    </div>
                    <p style="margin:0;font-size:1rem;line-height:1.75;color:#cbd5e1;">${summary}</p>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align:center;margin-bottom:32px;">
                    <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;text-decoration:none;font-weight:700;font-size:0.95rem;padding:14px 36px;border-radius:10px;letter-spacing:0.02em;">
                      Open Prism →
                    </a>
                  </div>

                  <!-- Divider -->
                  <div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:24px;"></div>

                  <!-- Footer note -->
                  <p style="margin:0;font-size:0.78rem;color:#475569;text-align:center;line-height:1.6;">
                    You're receiving this because you connected Slack to Prism.<br>
                    <a href="${appUrl}/account" style="color:#6366f1;text-decoration:none;">Manage preferences</a>
                  </p>

                </td>
              </tr>
            </td>
          </tr>

          <!-- Bottom spacer -->
          <tr><td style="height:32px;"></td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="margin:0;font-size:0.72rem;color:#334155;">© 2026 Prism · Built with ♥️</p>
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
    weekOf: string
): Promise<boolean> {
    const appUrl = process.env.APP_URL || 'https://prism.vercel.app';
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Prism <onboarding@resend.dev>';

    try {
        const { error } = await resend.emails.send({
            from: fromEmail,
            to,
            subject: `✦ Your Weekly Prism Digest — ${weekOf}`,
            html: buildEmailHtml(name || 'there', summary, weekOf, appUrl),
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
