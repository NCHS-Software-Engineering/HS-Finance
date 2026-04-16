// We need "use client" because we're using useSession which requires the browser
"use client";

import Entries from "@/components/Entries";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function Transactions() {
  // useSession checks if someone is logged in
  // session = user data if logged in, null if not logged in
  const { data: session } = useSession();

    return (
        <Entries/>
    );
}