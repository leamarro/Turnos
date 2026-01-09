import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware() {},
  {
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    /*
      Protege todo MENOS:
      - login
      - nextauth
      - assets
    */
    "/((?!login|api/auth|_next|favicon.ico).*)",
  ],
}
