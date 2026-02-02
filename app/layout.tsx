import "../styles/globals.css";

export const metadata = {
  title: "DAP Déclic Pro",
  description: "Analyse CV + profil achats → recommandations instantanées"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
