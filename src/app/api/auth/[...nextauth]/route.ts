import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "supersecretnextauthsessionkey",
  // Ensure NEXTAUTH_URL is configured/verified
  pages: {
    signIn: "/",
    error: "/", // Redirect back to sign-in with query ?error=
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user || !account) {
        console.error("Server-side auth failure during signIn callback: Missing user or account data.");
        return false;
      }
      return true;
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
