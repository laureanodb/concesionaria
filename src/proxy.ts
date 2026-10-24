import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Chequeo rápido: sin sesión válida no se entra al panel. Cada página y acción
// del panel vuelve a validar el usuario contra la base de datos (src/lib/auth.ts).
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("al_session")?.value;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
      return NextResponse.next();
    } catch {
      // token inválido o vencido
    }
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
