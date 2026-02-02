"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";

const PURPLE = "#503DE3";
const ORANGE = "#F7A500";

type Result = any;

export default function ResultsPage() {
  const [result, setResult] = useState<Result | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("dap_result");
    if (raw) setResult(JSON.parse(raw));
  }, []);

  const title = useMemo(() => result?.profile_type ?? "Résultats", [result]);

  function downloadPDF() {
    if (!result) return;

    const doc = new jsPDF();
    let y = 12;

    doc.setFont("helvetica", "bold");
    doc.text("DAP Déclic Pro — Résultats", 10, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.text(`Type de profil: ${result.profile_type}`, 10, y);
    y += 8;
    doc.text(`Compatibilité: ${result.compatibility.score_percent}%`, 10, y);
    y += 8;

    doc.text("Points forts:", 10, y);
    y += 6;
    (result.strengths || []).slice(0, 8).forEach((s: string) => {
      doc.text(`- ${s}`, 12, y);
      y += 6;
    });

    y += 2;
    doc.text("Limites:", 10, y);
    y += 6;
    (result.limits || []).slice(0, 8).forEach((s: string) => {
      doc.text(`- ${s}`, 12, y);
      y += 6;
    });

    y += 2;
    doc.text("Plan d'action:", 10, y);
    y += 6;
    doc.text(result.action_plan?.summary || "", 10, y);
    y += 8;

    (result.action_plan?.steps || []).slice(0, 10).forEach((s: string) => {
      doc.text(`- ${s}`, 12, y);
      y += 6;
    });

    doc.save("dap-declic-pro-resultats.pdf");
  }

  async function sendEmail() {
    if (!result) return;

    const to = prompt("Email destinataire ?");
    if (!to) return;

    setEmailStatus("Envoi…");
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, result })
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Erreur envoi");

      setEmailStatus("Email envoyé ✅");
    } catch (e: any) {
      setEmailStatus(e?.message || "Erreur email");
    }
  }

  if (!result) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-700">
            Aucun résultat. Relance l’analyse depuis la page d’accueil.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="px-6 py-6 border-b">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-semibold" style={{ color: PURPLE }}>
            {title}
          </h1>

          <p className="text-sm text-gray-600">
            Compatibilité poste actuel:{" "}
            <span className="font-semibold" style={{ color: ORANGE }}>
              {result.compatibility.score_percent}%
            </span>{" "}
            — {result.compatibility.rationale}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={downloadPDF}
              className="rounded-2xl border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: PURPLE, color: PURPLE }}
            >
              Sauvegarder en PDF
            </button>

            <button
              onClick={sendEmail}
              className="rounded-2xl border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: ORANGE, color: ORANGE }}
            >
              Envoyer par email
            </button>

            {emailStatus && (
              <span className="text-sm text-gray-600 self-center">{emailStatus}</span>
            )}
          </div>
        </div>
      </header>

      <section className="px-6 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Points forts" accent={PURPLE}>
            <ul className="list-disc pl-5 space-y-1">
              {result.strengths.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Card>

          <Card title="Limites / angles morts" accent={ORANGE}>
            <ul className="list-disc pl-5 space-y-1">
              {result.limits.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Card>

          <div className="lg:col-span-2">
            <Card title="3 postes recommandés" accent={PURPLE}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.recommended_roles.map((r: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border p-4">
                    {r.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.image_url}
                        alt=""
                        className="w-full h-28 object-cover rounded-xl mb-3"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold">{r.title}</h3>
                      <span className="text-sm font-semibold" style={{ color: ORANGE }}>
                        {r.score_percent}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{r.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="5 entreprises compatibles" accent={ORANGE}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {result.recommended_companies.map((c: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border p-3">
                    {c.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.logo_url}
                        alt=""
                        className="w-full h-10 object-contain rounded-lg mb-2"
                      />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <span className="text-xs font-semibold" style={{ color: PURPLE }}>
                        {c.score_percent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Plan d’action proposé" accent={PURPLE}>
              <p className="text-gray-700">{result.action_plan.summary}</p>
              <ol className="list-decimal pl-5 space-y-1 mt-3">
                {result.action_plan.steps.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Prochaine étape : plan de formation adapté.
                </div>

                <a
                  href={result.dap_training_cta.url}
                  className="rounded-2xl px-6 py-3 font-semibold text-white text-center"
                  style={{ background: ORANGE }}
                >
                  {result.dap_training_cta.label || "Découvrir mon plan de formation DAP"}
                </a>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
