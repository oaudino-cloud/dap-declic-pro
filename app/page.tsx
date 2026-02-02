"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PURPLE = "#503DE3";
const ORANGE = "#F7A500";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [cv, setCv] = useState<File | null>(null);
  const [data, setData] = useState({
    current_role: "",
    seniority: "Intermédiaire",
    industry: "",
    goals: "",
    strengths_self: "",
    constraints: "",
    email: "",
    phone: ""
  });

  const canSubmit = useMemo(() => {
    return !!cv && data.current_role.trim() && data.email.trim() && data.phone.trim();
  }, [cv, data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!cv) return setErr("Ajoute ton CV (PDF ou DOCX).");

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("cv", cv);
      Object.entries(data).forEach(([k, v]) => fd.append(k, v));

      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || !json.ok) throw new Error(json.error || "Erreur analyse");

      sessionStorage.setItem("dap_result", JSON.stringify(json.result));
      router.push("/results");
    } catch (e: any) {
      setErr(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="px-6 py-6 border-b">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: PURPLE }}>
              DAP Déclic Pro
            </h1>
            <p className="text-sm text-gray-600">
              Analyse CV + profil achats → recommandations instantanées
            </p>
          </div>
          <span
            className="text-xs px-3 py-1 rounded-full border"
            style={{ borderColor: PURPLE, color: PURPLE }}
          >
            v0.8
          </span>
        </div>
      </header>

      <section className="px-6 py-10">
        <form onSubmit={onSubmit} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">1) Ton CV</h2>

            <label className="block text-sm text-gray-700 mb-2">Importer (PDF ou DOCX)</label>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setCv(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border p-3"
            />

            {cv && (
              <p className="text-xs text-gray-600 mt-2">
                Fichier: <span className="font-medium">{cv.name}</span>
              </p>
            )}

            <div className="mt-6 rounded-xl p-4" style={{ background: "rgba(80,61,227,0.06)" }}>
              <p className="text-sm text-gray-700">
                Conseil : un CV complet (missions, résultats, outils, langues) améliore la précision.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">2) Ton profil</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Poste actuel *">
                <input
                  className="w-full rounded-xl border p-3"
                  value={data.current_role}
                  onChange={(e) => setData({ ...data, current_role: e.target.value })}
                  placeholder="ex: Acheteur / Category Manager"
                />
              </Field>

              <Field label="Séniorité">
                <select
                  className="w-full rounded-xl border p-3"
                  value={data.seniority}
                  onChange={(e) => setData({ ...data, seniority: e.target.value })}
                >
                  <option>Junior</option>
                  <option>Intermédiaire</option>
                  <option>Senior</option>
                  <option>Manager</option>
                  <option>Direction</option>
                </select>
              </Field>

              <Field label="Industrie / secteur">
                <input
                  className="w-full rounded-xl border p-3"
                  value={data.industry}
                  onChange={(e) => setData({ ...data, industry: e.target.value })}
                  placeholder="ex: Industrie, IT, Retail, Pharma…"
                />
              </Field>

              <Field label="Contraintes (mobilité, remote, salaire…)">
                <input
                  className="w-full rounded-xl border p-3"
                  value={data.constraints}
                  onChange={(e) => setData({ ...data, constraints: e.target.value })}
                  placeholder="ex: Remote 2j/sem, Montréal uniquement…"
                />
              </Field>
            </div>

            <Field label="Objectifs (6–12 mois)">
              <textarea
                className="w-full rounded-xl border p-3 min-h-[90px]"
                value={data.goals}
                onChange={(e) => setData({ ...data, goals: e.target.value })}
                placeholder="ex: évoluer vers category management, monter en SRM…"
              />
            </Field>

            <Field label="Tes forces (selon toi)">
              <textarea
                className="w-full rounded-xl border p-3 min-h-[90px]"
                value={data.strengths_self}
                onChange={(e) => setData({ ...data, strengths_self: e.target.value })}
                placeholder="ex: négociation, analyse spend, relation fournisseurs…"
              />
            </Field>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">3) Coordonnées</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email *">
                <input
                  type="email"
                  className="w-full rounded-xl border p-3"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="ex: toi@entreprise.com"
                />
              </Field>

              <Field label="Téléphone *">
                <input
                  className="w-full rounded-xl border p-3"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="ex: +1 514 ..."
                />
              </Field>
            </div>

            {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                La clé OpenAI reste côté serveur (route API), jamais dans ton navigateur.
              </p>

              <button
                disabled={!canSubmit || loading}
                className="rounded-2xl px-6 py-3 font-semibold text-white disabled:opacity-50"
                style={{ background: canSubmit ? PURPLE : "#999" }}
              >
                {loading ? "Analyse en cours…" : "Lancer l’analyse"}
              </button>
            </div>
          </div>
        </form>
      </section>

      <footer className="px-6 pb-10">
        <div className="max-w-5xl mx-auto text-xs text-gray-500">
          Couleurs: <span style={{ color: PURPLE }}>violet</span> &{" "}
          <span style={{ color: ORANGE }}>orange</span>
        </div>
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mt-4">
      <span className="block text-sm text-gray-700 mb-2">{label}</span>
      {children}
    </label>
  );
}
