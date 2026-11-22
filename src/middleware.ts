import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    const roles = (token?.roles as string[]) || [];

    // 1. Protection de l'espace Administration (/admin/*)
    if (pathname.startsWith("/admin")) {
      const isAllowedAdmin =
        roles.includes("SUPERADMIN") ||
        roles.includes("ADMIN") ||
        roles.includes("EDITOR");

      if (!isAllowedAdmin) {
        return NextResponse.redirect(new URL("/connexion?error=AdminAccessDenied", req.url));
      }
    }

    // 2. Protection de l'espace Artisan (/atelier/* sauf inscription et connexion)
    if (
      pathname.startsWith("/atelier") &&
      !pathname.startsWith("/atelier/inscription") &&
      !pathname.startsWith("/atelier/connexion")
    ) {
      const isArtisan = roles.includes("ARTISAN");
      if (!isArtisan) {
        return NextResponse.redirect(new URL("/atelier/connexion?error=ArtisanAccessRequired", req.url));
      }
    }

    // 3. Protection de l'espace Client (/compte/*)
    if (pathname.startsWith("/compte")) {
      if (!token) {
        return NextResponse.redirect(new URL("/connexion?error=LoginRequired", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Les pages publiques d'inscription/connexion artisan ne nécessitent pas de token
        if (
          pathname.startsWith("/atelier/inscription") ||
          pathname.startsWith("/atelier/connexion")
        ) {
          return true;
        }

        // Pour les autres zones protégées, un token est requis
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/atelier") ||
          pathname.startsWith("/compte")
        ) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/atelier/:path*", "/compte/:path*"],
};
