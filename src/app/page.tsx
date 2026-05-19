import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const token = cookies().get(getSessionCookieName())?.value;
  const isLoggedIn = await verifySessionToken(token);
  redirect(isLoggedIn ? "/home" : "/login");
}
