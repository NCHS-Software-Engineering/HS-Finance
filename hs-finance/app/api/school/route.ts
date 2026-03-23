import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RowDataPacket } from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

export async function GET() {
    try {
        // ✅ Check if user is logged in
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
        }

        const userEmail = session.user.email;

        // ✅ Check user exists
        const [user] = await connection.execute<RowDataPacket[]>(
            "SELECT ID, SchoolID, AccountType FROM User WHERE Email = ?",
            [userEmail]
        );

        if (user.length === 0) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        let rows;

        // ✅ If Dev → see all schools
        if (user[0].AccountType === "Dev") {
            [rows] = await connection.execute(
                "SELECT ID, SchoolName FROM School ORDER BY SchoolName ASC"
            );
        } 
        // ✅ Otherwise → only their school
        else {
            [rows] = await connection.execute(
                "SELECT ID, SchoolName FROM School WHERE ID = ?",
                [user[0].SchoolID]
            );
        }

        return NextResponse.json(rows);
    } 
    catch (err) {
        console.log(err);
        return NextResponse.json(
            { error: "Failed to fetch schools." },
            { status: 500 }
        );
    }
}