import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "campus-demo",
    name: "Campus Account",
    credentials: {
      name: { label: "Full Name", type: "text", placeholder: "Praveen Kumar" },
      email: { label: "Campus Email", type: "email", placeholder: "student@campus.edu" },
    },
    async authorize(credentials) {
      if (!credentials?.email) return null;
      const name = credentials.name || credentials.email.split("@")[0];
      return {
        id: credentials.email.replace(/[^a-zA-Z0-9]/g, "-"),
        name,
        email: credentials.email,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=7c3aed`,
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || "stay-composed-auth-secret-key-32chars-min",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user, profile }) {
      if (user) {
        token.id = user.id;
        if (user.image) {
          token.picture = user.image;
        }
      }
      if ((profile as any)?.picture) {
        token.picture = (profile as any).picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          (session.user as any).id = token.id;
        }
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
};