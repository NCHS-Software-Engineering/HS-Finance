// <SessionProvider> is necessary to use the useSession function from NextAuth
// We can use this file within layout.tsx to make sure every component has access to useSession()
// Since this is a component, you could put it in the components folder
// Dr. Miller's personal preference is to put it in lib since it has more of a library file feel than a component feel

"use client";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

// We have a props object below that is going to pull information about the children of the <Providers> component
// We pull out the children key in the code below using {children}
// The PropsWithChildren type basically states the children can also have children
export function Providers({children} : PropsWithChildren) {
    // We return the exact same children of the <Providers> component, now wrapped in a <SessionProvider>
    return <SessionProvider>{children}</SessionProvider>
}