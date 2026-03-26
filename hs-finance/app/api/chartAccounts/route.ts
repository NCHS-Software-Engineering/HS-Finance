// app/api/accounts/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

// GET: fetch all accounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const [allowedUser] = await connection.execute<RowDataPacket[]>(
      "SELECT ID FROM User WHERE Email = ?",
      [userEmail]
    );

    if (allowedUser.length === 0) {
      return NextResponse.json({ error: "Access Denied" }, { status: 403 });
    }

    const [rows] = await connection.execute(
      "SELECT ID, AccountName FROM Account ORDER BY AccountName ASC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Failed to fetch chart of accounts." }, { status: 500 });
  }
}

// POST: add a new account
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
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

// DELETE: remove an account by ID
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
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