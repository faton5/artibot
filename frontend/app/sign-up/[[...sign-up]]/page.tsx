import { SignUp } from "@clerk/nextjs";
import { Zap, CheckCircle } from "lucide-react";

const FEATURES = [
  "Qualification automatique des leads par IA",
  "Réponses instantanées 24h/24 par email et SMS",
  "Rapports de qualification envoyés automatiquement",
  "Tableau de bord métier pour artisans",
];

export default function SignUpPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 p-12"
        style={{ background: "#111113" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
          >
            <Zap className="w-5 h-5" style={{ color: "#ea580c" }} />
          </div>
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "20px",
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            ArtiBot
          </span>
        </div>

        <div>
          <p
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: "32px",
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
            }}
          >
            Démarrez en moins de 15 minutes
          </p>

          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ea580c" }} />
                <span style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: "12px", color: "#52525b" }}>
          © 2025 ArtiBot — Fait pour les artisans français
        </p>
      </div>

      {/* Right panel — sign up */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ background: "#f7f6f3" }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#ea580c" }} />
            </div>
            <span
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                fontSize: "18px",
                color: "#111113",
              }}
            >
              ArtiBot
            </span>
          </div>

          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#ea580c",
                colorBackground: "#ffffff",
                colorText: "#111113",
                colorTextSecondary: "#8e8e98",
                colorInputBackground: "#ffffff",
                colorInputText: "#111113",
                borderRadius: "12px",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              },
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0 bg-transparent",
                headerTitle: "font-bold text-[22px]",
                headerSubtitle: "text-[13px]",
                socialButtonsBlockButton:
                  "border border-gray-200 hover:bg-gray-50 text-[13px] font-medium rounded-xl",
                formButtonPrimary:
                  "bg-[#ea580c] hover:bg-[#c2410c] text-[13px] font-semibold rounded-xl",
                formFieldInput:
                  "border-gray-200 focus:border-gray-400 rounded-xl text-[13px]",
                footerActionLink: "text-[#ea580c] hover:text-[#c2410c]",
                dividerLine: "bg-gray-100",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
