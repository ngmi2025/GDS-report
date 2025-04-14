import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: "RefreshAccessTokenError"
  }
}

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    accessTokenExpires?: number
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid email profile https://www.googleapis.com/auth/webmasters.readonly",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : undefined,
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      // Access token has expired, try to refresh it
      if (!token.refreshToken) {
        throw new Error("No refresh token available")
      }

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
          }),
          method: "POST",
        })

        const tokens = await response.json()

        if (!response.ok) {
          throw tokens
        }

        return {
          ...token,
          accessToken: tokens.access_token,
          accessTokenExpires: Date.now() + (tokens.expires_in ?? 3600) * 1000,
        }
      } catch (error) {
        console.error("Error refreshing access token", error)
        return { ...token, error: "RefreshAccessTokenError" }
      }
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = "RefreshAccessTokenError"
      }
      session.accessToken = token.accessToken
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
