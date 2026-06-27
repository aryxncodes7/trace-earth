import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("NEXTAUTH_SECRET is not set. NextAuth will likely fail in production.");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // Ensure NEXTAUTH_URL is configured/verified
  pages: {
    signIn: "/",
    error: "/", // Redirect back to sign-in with query ?error=
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email || !account?.providerAccountId) {
        console.error("Server-side auth failure during signIn callback: Missing essential user or account data.");
        return false;
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub || token.providerAccountId;
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      // log cleanup if any
    },
  },
  logger: {
    error(code, metadata) {
      console.error(`NextAuth server-side Error [${code}]:`, metadata);
    },
    warn(code) {
      // standard warnings
    },
    debug(code, metadata) {
      // standard debugs
    },
  }
};

// Check if NEXTAUTH_URL is defined and log warnings if missing or incorrect
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (!nextAuthUrl) {
  console.error("NEXTAUTH_URL is missing in raw server-side .env environment!");
} else {
  console.log(`NextAuth initialized with callback target URL: ${nextAuthUrl}`);
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
