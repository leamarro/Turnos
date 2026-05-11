import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(getSessionCookieName(), "", {
    path: "/",
    expires: new Date(0),
  });

  response.cookies.set("username", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
