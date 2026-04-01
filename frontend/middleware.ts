import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = await clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, event);

  const res = response ?? NextResponse.next();

  // Clerk v6 injecte une CSP stricte avec nonces — on ajoute 'unsafe-eval'
  // pour les bundles Next.js qui en ont besoin
  const csp = res.headers.get("content-security-policy");
  if (csp && !csp.includes("'unsafe-eval'")) {
    const updated = csp.includes("script-src")
      ? csp.replace(/script-src ([^;]*)/, "script-src $1 'unsafe-eval'")
      : csp.replace(/default-src ([^;]*)/, "default-src $1 'unsafe-eval'");
    res.headers.set("content-security-policy", updated);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
