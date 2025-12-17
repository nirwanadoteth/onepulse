import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const OLD_DOMAIN = "onepulse-ruby.vercel.app";
const NEW_DOMAIN = "onepulse.nirwana.lol";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Don't redirect the manifest path—serve it from old domain
  if (pathname === "/.well-known/farcaster.json") {
    return NextResponse.next();
  }

  // Redirect all other paths from old domain to new domain
  const host = request.headers.get("host") || "";
  if (host.includes(OLD_DOMAIN)) {
    const newUrl = request.nextUrl.clone();
    newUrl.host = NEW_DOMAIN;
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
