// This route will match when useSession is called
// Frontend - useSession() -> 
//  API Route (app/api/auth/[...nextauth]/route.ts), Exports handler as GET and POST -> 
//      NextAuth Handler, Determines provider and session login in combination with authOptions ->
//          authOptions.ts, Configuration to use for the login attempt ->
//              Google OAuth & JWT, Redirects user to Google for login / Received OAuth callback / Creates session ->
//                  Frontend, Session information now available to frontend

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({session}) {
            // session.user.email will identify the student
            return session;
        }
    }
});

export {handler as GET, handler as POST};