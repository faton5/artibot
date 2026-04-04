import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background:
          "radial-gradient(ellipse at 50% -10%, rgba(144,77,0,0.10) 0%, #f8f9fa 55%)",
      }}
    >
      {/* Subtle warm texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 80% 80%, rgba(255,140,0,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] mx-4 flex flex-col gap-6">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-md"
            style={{
              background: "linear-gradient(135deg, #904d00 0%, #ff8c00 100%)",
            }}
          >
            <span
              className="material-symbols-outlined text-white text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              handyman
            </span>
          </div>
          <span
            className="font-headline font-black text-xl tracking-tight"
            style={{ color: "#191c1d" }}
          >
            ArtiBot
          </span>
          <p className="text-xs mt-1" style={{ color: "#897362" }}>
            Le compagnon digital de l&apos;artisan moderne.
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl px-8 py-8 shadow-sm"
          style={{ background: "#ffffff" }}
        >
          <h1
            className="text-xl font-extrabold font-headline text-center mb-6"
            style={{ color: "#191c1d" }}
          >
            Heureux de vous revoir
          </h1>

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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex gap-4" style={{ color: "#c4c5c6" }}>
            <a href="#" className="hover:text-slate-500 transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-slate-500 transition-colors">
              Aide
            </a>
          </div>
          <div
            className="flex items-center gap-1.5 font-semibold text-xs"
            style={{ color: "#564334" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "#22c55e" }}
            />
            ArtiBot Actif
          </div>
        </div>
      </div>
    </div>
  );
}
