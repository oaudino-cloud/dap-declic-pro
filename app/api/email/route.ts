import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { to, result } = await req.json();
    if (!to) return NextResponse.json({ error: "Destinataire manquant" }, { status: 400 });

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        { error: "Email non configuré (SMTP_* manquants). Tu peux ignorer cette option pour l’instant." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const html = `
      <h2>DAP Déclic Pro — Résultats</h2>
      <p><b>Type:</b> ${result.profile_type}</p>
      <p><b>Compatibilité:</b> ${result.compatibility.score_percent}%</p>
      <p><b>Plan:</b> ${result.action_plan.summary}</p>
      <pre style="background:#f6f6f6;padding:12px;border-radius:8px">${escapeHtml(JSON.stringify(result, null, 2))}</pre>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@dap-declic-pro.local",
      to,
      subject: "DAP Déclic Pro — Tes résultats",
      html
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erreur email" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
