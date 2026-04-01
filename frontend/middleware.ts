import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // Génère un nonce cryptographique pour la CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://*.clerk.com https://*.clerk.dev https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src * data: blob:`,
    `connect-src 'self' https://*.clerk.com https://clerk-telemetry.com https://*.sentry.io`,
    `frame-src https://challenges.cloudflare.com`,
    `worker-src blob:`,
    `font-src 'self'`,
  ].join("; ");

  // Passe le nonce au layout via un header interne
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = await clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(
    new NextRequest(request, { headers: requestHeaders }),
    event,
  );

  const res = response ?? NextResponse.next({ request: { headers: requestHeaders } });

  // Applique la CSP sur la réponse
  res.headers.set("content-security-policy", csp);
  res.headers.set("x-nonce", nonce);

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
