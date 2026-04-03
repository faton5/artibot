import { SignUp } from "@clerk/nextjs";

const FEATURES = [
  "Qualification automatique des leads par IA",
  "Réponses instantanées 24h/24 par email et SMS",
  "Rapports de qualification envoyés automatiquement",
  "Tableau de bord métier pour artisans",
];

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] flex-shrink-0 p-12"
        style={{ background: "linear-gradient(160deg, #2e1a00 0%, #191c1d 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}>
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>robot</span>
          </div>
          <span className="font-headline font-black text-xl text-white tracking-tight">ArtiBot</span>
        </div>

        <div>
          <p className="font-headline font-extrabold text-3xl text-white leading-tight tracking-tight mb-6">
            Démarrez en moins de 2 minutes
          </p>
          <div className="space-y-3">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5" style={{ color: "#ff8c00", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm" style={{ color: "#ddc1ae", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs" style={{ color: "#564334" }}>© 2025 ArtiBot — Fait pour les artisans français</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#f3f4f5" }}>
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}>
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>robot</span>
            </div>
            <span className="font-headline font-black text-lg" style={{ color: "#191c1d" }}>ArtiBot</span>
          </div>

          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#904d00",
                colorBackground: "#ffffff",
                colorText: "#191c1d",
                colorTextSecondary: "#564334",
                colorInputBackground: "#f3f4f5",
                colorInputText: "#191c1d",
                borderRadius: "12px",
                fontFamily: "'Inter', system-ui, sans-serif",
              },
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 p-0 bg-transparent",
                headerTitle: "font-bold text-xl font-headline",
                headerSubtitle: "text-sm",
                socialButtonsBlockButton: "border border-surface-container-high hover:bg-surface-container-low text-sm font-medium rounded-xl",
                formButtonPrimary: "text-sm font-semibold rounded-xl",
                formFieldInput: "rounded-xl text-sm",
                footerActionLink: "font-semibold",
                dividerLine: "bg-surface-container-high",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
