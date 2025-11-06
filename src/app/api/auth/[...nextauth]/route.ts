import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "tuUsuario" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // 🔐 Usuario y contraseña hardcodeados (puedes conectar a DB luego)
        const user = { id: "1", name: "Admin", username: "admin", password: "1234" }

        if (
          credentials?.username === user.username &&
          credentials?.password === user.password
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
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
})

export { handler as GET, handler as POST }
