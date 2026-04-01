import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest, type NextFetchEvent } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const clerkResponse = await clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, event);

  const base = clerkResponse ?? NextResponse.next();

  // Clerks's response headers sont immutables — on crée une nouvelle response
  const newHeaders = new Headers(base.headers);
  const csp = newHeaders.get("content-security-policy");
  if (csp && !csp.includes("'unsafe-eval'")) {
    newHeaders.set(
      "content-security-policy",
      csp.includes("script-src")
        ? csp.replace(/script-src ([^;]*)/, "script-src $1 'unsafe-eval'")
        : csp.replace(/default-src ([^;]*)/, "default-src $1 'unsafe-eval'"),
    );
  }

  return new NextResponse(base.body, {
    status: base.status,
    statusText: base.statusText,
    headers: newHeaders,
  });
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
