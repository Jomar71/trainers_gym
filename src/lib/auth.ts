import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                try {
                    // Find user in database
                    const user = await db.user.findUnique({
                        where: { email: credentials.email as string }
                    })

                    if (!user || !user.password) {
                        return null
                    }

                    // Verify password using bcrypt
                    const isValid = await bcrypt.compare(credentials.password as string, user.password)

                    if (!isValid) {
                        return null
                    }

                    // Return user object with role
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string
                // @ts-expect-error - Adding role to session
                session.user.role = token.role as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-expect-error - Adding role to token
                token.role = user.role
            }
            return token
        }
    },
    pages: {
        signIn: "/login",
    },
    debug: true,
})
