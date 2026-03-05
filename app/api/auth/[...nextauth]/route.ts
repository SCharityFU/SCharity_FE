import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        // No custom sign-in page — use Google popup directly
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
    },
});

export { handler as GET, handler as POST };
