import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ success: true });

  res.cookies.set({
    name: getSessionCookieName(),
    value: "",
    expires: new Date(0),
    path: "/",
  });

  return res;
}
