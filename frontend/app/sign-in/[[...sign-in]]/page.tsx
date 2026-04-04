import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "radial-gradient(ellipse at 50% -10%, rgba(144,77,0,0.12) 0%, #f8f9fa 55%)",
      }}
    >
      {/* Warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 80% 80%, rgba(255,140,0,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] mx-4">
        <div
          className="rounded-3xl px-8 py-9 shadow-xl overflow-hidden"
          style={{
            background: "#ffffff",
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
              style={{ background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)" }}
            >
              <span
                className="material-symbols-outlined text-white text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                handyman
              </span>
            </div>
            <span className="font-headline font-black text-2xl tracking-tight" style={{ color: "#191c1d" }}>
              ArtiBot
            </span>
            <p className="text-xs mt-1" style={{ color: "#897362" }}>
              L&apos;atelier numérique des artisans
            </p>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-extrabold font-headline" style={{ color: "#191c1d" }}>
              Heureux de vous revoir
            </h1>
            <p className="text-sm mt-1" style={{ color: "#564334" }}>
              Connectez-vous à votre espace artisan.
            </p>
          </div>

          <SignIn
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
                rootBox: { width: "100%" },
                card: {
                  boxShadow: "none",
                  border: "none",
                  padding: "0",
                  background: "transparent",
                  width: "100%",
                  maxWidth: "100%",
                },
                header: { display: "none" },
                socialButtonsBlockButton: {
                  border: "1px solid #e7e8e9",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                },
                formButtonPrimary: {
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                },
                formFieldInput: {
                  borderRadius: "12px",
                  fontSize: "14px",
                },
                footerActionLink: { fontWeight: "600" },
                dividerLine: { background: "#f3f4f5" },
              },
            }}
          />

          {/* Trust footer */}
          <div
            className="mt-5 pt-5 flex items-center justify-center gap-5 flex-wrap"
            style={{ borderTop: "1px solid #f3f4f5" }}
          >
            {[
              { icon: "bolt", text: "GPT-4o actif" },
              { icon: "lock", text: "Sécurisé" },
              { icon: "check_circle", text: "Gratuit 14 jours" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs" style={{ color: "#897362" }}>
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ color: "#904d00", fontVariationSettings: "'FILL' 1" }}
                >
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
