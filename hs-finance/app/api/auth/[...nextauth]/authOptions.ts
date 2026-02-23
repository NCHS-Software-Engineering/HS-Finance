// authOptions.ts is required for NextAuth
// This file specifies how users should login, how sessions are handled, and which providers are

import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    // Specify the login providers that can be used
    // While we just used Google, you can use as many login providers as you want
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    // Our session information is stored in a JSON web token (JWT) and stored in a cookie
    // This is a common way of storing session information, alternatively you could store session information in a database
    session: {
        strategy: "jwt",
    },
};