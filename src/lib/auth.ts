// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

// 1. Definisikan authOptions SEKALI SAJA dan ekspor
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.employee.findFirst({
          where: { email: credentials.email },
          include: { role: true }
        });

        if (!user || !user.password) {
          throw new Error("Email atau password salah.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Email atau password salah.");
        }

        // Kembalikan data ke Session
        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role?.name || "EMPLOYEE",
          tenantId: user.tenantId,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.tenantId = token.tenantId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 2. Buat handler berdasarkan authOptions
const handler = NextAuth(authOptions);

// 3. Ekspor GET dan POST untuk API Route
export { handler as GET, handler as POST };