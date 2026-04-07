// app/api/accounts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

// Helper: fetch the user's role from the DB
async function getUserRole(email: string): Promise<string | null> {
  const [rows] = await connection.execute<RowDataPacket[]>(
    "SELECT Role FROM User WHERE Email = ?",
    [email]
  );
  if (rows.length === 0) return null;
  return rows[0].Role;
}

// GET: fetch all accounts (any logged-in user)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }

    const [allowedUser] = await connection.execute<RowDataPacket[]>(
      "SELECT ID FROM User WHERE Email = ?",
      [session.user.email]
    );

    if (allowedUser.length === 0) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const [rows] = await connection.execute(
      "SELECT ID, AccountName FROM Account ORDER BY ID ASC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to fetch chart of accounts." }, { status: 500 });
  }
}

// POST: add a new account (head treasurer only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }

    // 🔒 Check that the user is a head treasurer
    const role = await getUserRole(session.user.email);
    if (role !== "HeadTreasurer" && role !== "Dev") {
      return NextResponse.json({ error: "Access Denied: Head Treasurer only" }, { status: 403 });
    }

    const { AccountName } = await req.json();
    if (!AccountName) {
      return NextResponse.json({ error: "AccountName is required" }, { status: 400 });
    }

    const [result] = await connection.execute<ResultSetHeader>(
      "INSERT INTO Account (AccountName) VALUES (?)",
      [AccountName]
    );

    return NextResponse.json({ message: "Account added", id: result.insertId });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to add account." }, { status: 500 });
  }
}

// DELETE: remove an account by ID (head treasurer only)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }

    // 🔒 Check that the user is a head treasurer
    const role = await getUserRole(session.user.email);
    if (role !== "HeadTreasurer" && role !== "Dev") {
      return NextResponse.json({ error: "Access Denied: Head Treasurer only" }, { status: 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await connection.execute("DELETE FROM Account WHERE ID = ?", [id]);
    return NextResponse.json({ message: "Account deleted" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}