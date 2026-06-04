type EmailInfoItem = {
  label: string;
  value: string;
};

type EmailTemplateInput = {
  title: string;
  eyebrow?: string;
  intro?: string;
  body?: string;
  cta?: {
    label: string;
    href: string;
  };
  infoTitle?: string;
  infoItems?: EmailInfoItem[];
  note?: string;
  footer?: string;
};

const brandName = "CCTT";
const defaultFooter =
  "Châlons-en-Champagne tennis de table - le ping pour tous";
const clubName = "Châlons-en-Champagne tennis de table";
const brandAccent = "#2563eb";
const logoPath = "/logo.jpg";

function getPublicAssetUrl(path: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL ?? "";

  if (!baseUrl) {
    return "";
  }

  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderParagraph(value?: string) {
  if (!value) {
    return "";
  }

  return `<p style="margin:0 0 18px;color:#334155;font-size:16px;line-height:1.75;white-space:pre-line;">${escapeHtml(value)}</p>`;
}

function renderInfoItems(title?: string, items?: EmailInfoItem[]) {
  const visibleItems = items?.filter((item) => item.value.trim()) ?? [];

  if (visibleItems.length === 0) {
    return "";
  }

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0;border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;overflow:hidden;">
      ${
        title
          ? `<tr><td colspan="2" style="padding:18px 20px 10px;color:#0f172a;font-size:15px;font-weight:900;background:#eff6ff;">${escapeHtml(title)}</td></tr>`
          : ""
      }
      ${visibleItems
        .map(
          (item) => `
            <tr>
              <td style="padding:13px 20px;color:#64748b;font-size:13px;line-height:1.5;border-top:1px solid #dbeafe;width:38%;">${escapeHtml(item.label)}</td>
              <td style="padding:13px 20px;color:#0f172a;font-size:14px;line-height:1.5;border-top:1px solid #dbeafe;font-weight:700;">${escapeHtml(item.value)}</td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

function renderCta(cta?: EmailTemplateInput["cta"]) {
  if (!cta) {
    return "";
  }

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px;">
      <tr>
        <td style="border-radius:999px;background:${brandAccent};box-shadow:0 12px 24px rgba(37,99,235,0.24);">
          <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:15px;font-weight:900;text-decoration:none;border-radius:999px;">
            ${escapeHtml(cta.label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function renderEmailTemplate(input: EmailTemplateInput) {
  const logoUrl = getPublicAssetUrl(logoPath);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#edf2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#edf2f7;margin:0;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-collapse:separate;border-spacing:0;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 22px 60px rgba(15,23,42,0.12);">
            <tr>
              <td style="height:7px;background:${brandAccent};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:26px 30px 18px;background:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      ${
                        logoUrl
                          ? `<img src="${escapeHtml(logoUrl)}" width="172" alt="" style="display:block;width:172px;max-width:172px;height:auto;margin:0;border:0;outline:none;text-decoration:none;" />`
                          : `<div style="font-size:24px;font-weight:900;letter-spacing:0;color:#0f172a;">${brandName}</div>`
                      }
                      <div style="margin-top:10px;color:#64748b;font-size:13px;line-height:1.5;">${clubName}</div>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:#eff6ff;color:${brandAccent};font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;">Club</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 30px 32px;">
                ${
                  input.eyebrow
                    ? `<div style="margin:0 0 10px;color:${brandAccent};font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;">${escapeHtml(input.eyebrow)}</div>`
                    : ""
                }
                <h1 style="margin:0 0 16px;color:#0f172a;font-size:30px;line-height:1.15;font-weight:900;letter-spacing:0;">${escapeHtml(input.title)}</h1>
                ${renderParagraph(input.intro)}
                ${renderParagraph(input.body)}
                ${renderInfoItems(input.infoTitle, input.infoItems)}
                ${renderCta(input.cta)}
                ${
                  input.note
                    ? `<p style="margin:22px 0 0;padding:16px 18px;background:#eff6ff;border-left:4px solid ${brandAccent};border-radius:12px;color:#1e3a8a;font-size:14px;line-height:1.65;">${escapeHtml(input.note)}</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:22px 30px;background:#0f172a;color:#cbd5e1;font-size:12px;line-height:1.6;">
                ${escapeHtml(input.footer ?? defaultFooter)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
