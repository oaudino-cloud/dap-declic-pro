import { NextResponse } from "next/server";
import OpenAI from "openai";
import { extractTextFromFile } from "@/lib/extract";
import { DAP_SCHEMA } from "@/lib/schema";

export const runtime = "nodejs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY manquante" }, { status: 500 });
    }

    const form = await req.formData();
    const file = form.get("cv") as File | null;
    if (!file) return NextResponse.json({ error: "CV manquant" }, { status: 400 });

    const profile = {
      current_role: String(form.get("current_role") ?? ""),
      seniority: String(form.get("seniority") ?? ""),
      industry: String(form.get("industry") ?? ""),
      goals: String(form.get("goals") ?? ""),
      strengths_self: String(form.get("strengths_self") ?? ""),
      constraints: String(form.get("constraints") ?? "")
    };

    const contact = {
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? "")
    };

    const cvText = await extractTextFromFile(file);

    const system = `
Tu es un expert RH + achats (procurement) spécialisé en profils acheteurs.
Analyse un CV + réponses profil, et produis UNIQUEMENT un JSON conforme au schéma fourni (strict).
Aucun texte hors JSON, pas de markdown.
Les scores sont cohérents avec le CV.
Postes recommandés : 3 rôles achats plausibles + description concrète.
Entreprises : 5 compatibles + explication claire.
Plan d’action : progression carrière + compétences achats.
`.trim();

    const user = `
=== DONNÉES PROFIL ===
Poste actuel: ${profile.current_role}
Séniorité: ${profile.seniority}
Industrie: ${profile.industry}
Objectifs: ${profile.goals}
Forces (auto-déclarées): ${profile.strengths_self}
Contraintes: ${profile.constraints}

=== CV (texte extrait) ===
${cvText}

=== CONTACT (ne pas répéter) ===
Email: ${contact.email}
Téléphone: ${contact.phone}
`.trim();

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      text: {
        format: {
          type: "json_schema",
          ...DAP_SCHEMA
        }
      }
    });

    const jsonText = response.output_text?.trim();
    if (!jsonText) return NextResponse.json({ error: "Réponse vide du modèle" }, { status: 500 });

    const parsed = JSON.parse(jsonText);

    // CTA par défaut (à remplacer plus tard par ton URL)
    if (!parsed.dap_training_cta?.url) {
      parsed.dap_training_cta = {
        label: "Découvrir mon plan de formation DAP",
        url: "https://exemple.com/dap"
      };
    }

    return NextResponse.json({ ok: true, result: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erreur serveur" }, { status: 500 });
  }
}
