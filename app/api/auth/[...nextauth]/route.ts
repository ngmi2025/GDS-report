import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

// Debug logging
console.log('Auth Configuration:', {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.slice(0, 10) + '...',
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    accessToken?: string
    error?: "RefreshAccessTokenError"
    refreshToken?: string
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
          scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ account, profile }) {
      // Debug logging
      console.log('Sign In Attempt:', {
        hasAccount: !!account,
        hasProfile: !!profile,
        email: profile?.email,
      });
      
      if (account && profile) {
        return true;
      }
      return false;
    },
    async jwt({ token, account }) {
      // Debug logging
      console.log('JWT Callback:', {
        hasToken: !!token,
        hasAccount: !!account,
        accessToken: account?.access_token ? 'present' : 'missing',
        refreshToken: account?.refresh_token ? 'present' : 'missing',
      });
      
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Debug logging
      console.log('Session Callback:', {
        hasSession: !!session,
        hasToken: !!token,
        accessToken: token.accessToken ? 'present' : 'missing',
        refreshToken: token.refreshToken ? 'present' : 'missing',
      });
      
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Debug logging
      console.log('Redirect Callback:', { url, baseUrl });
      
      // If the URL starts with the base URL or is a relative path, allow it
      if (url.startsWith(baseUrl) || url.startsWith('/')) {
        console.log('Redirecting to:', url);
        return url;
      }
      
      // Default redirect to dashboard
      console.log('Redirecting to default:', `${baseUrl}/dashboard`);
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  debug: true, // Enable debug mode
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
