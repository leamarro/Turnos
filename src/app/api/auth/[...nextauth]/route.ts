import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null

        const user = {
          id: "1",
          name: "Admin",
          username: "admin",
        }

        if (
          credentials.username === "admin" &&
          credentials.password === "1234"
        ) {
          return user
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
