import { NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionMaxAge,
} from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD no configurada" },
      { status: 500 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json(
      { error: "Contrasena incorrecta" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  const token = await createSessionToken();

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: getSessionMaxAge(),
    secure: process.env.NODE_ENV === "production",
  });

  response.cookies.set("username", "Admin", {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    maxAge: getSessionMaxAge(),
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
