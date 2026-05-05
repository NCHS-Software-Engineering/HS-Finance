import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RowDataPacket } from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
        }

        const userEmail = session.user.email;

        // Get all registers the user can view with their balances
        const [rows] = await connection.execute<RowDataPacket[]>(
            `SELECT
                Register.ID,
                Register.RegisterName,
                COALESCE(SUM(Fund.Amount), 0) as Balance
            FROM Register
            LEFT JOIN Entry ON Register.ID = Entry.RegisterID
            LEFT JOIN Fund ON Entry.ID = Fund.EntryID
            JOIN User ON (User.SchoolID = Register.SchoolID OR User.AccountType = 'Dev')
            WHERE User.Email = ?
            GROUP BY Register.ID, Register.RegisterName
            ORDER BY Register.RegisterName ASC`,
            [userEmail]
        );

        return NextResponse.json(rows);
    } catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Failed to fetch register stats." }, { status: 500 });
    }
}
