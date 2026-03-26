import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

export async function GET() {
    try {
        // ✅ Require login
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "Not Authenticated" },
                { status: 401 }
            );
        }

        // ✅ Return all classes
        const [rows] = await connection.execute(
            `SELECT 
                ID, 
                ClassName 
            FROM Class
            ORDER BY ID ASC`
        );

        return NextResponse.json(rows);
    } 
    catch (err) {
        console.log(err);
        return NextResponse.json(
            { error: "Failed to fetch classes." },
            { status: 500 }
        );
    }
}