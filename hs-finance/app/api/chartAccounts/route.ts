// This file is a server component (note there is no "use client")
// route.ts is used for an API endpoint with a URL of /api/competencies

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

// A GET request is an HTTP method to retrieve some data from a server based on a request
// App Router automatically looks for exported functions based on HTTP methods such as GET
export async function GET() {
    // We try to execute a query on our database to select all of the competencies sorted by the skill name
    // The resulting rows are sent as JSON
    try {
        // Get the session information and check that the session is valid with a user email
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({error: "Not Authenticated"}, {status: 401});
        }

        // Check that the user has access (All users can view Chart of Accounts)
        const userEmail = session.user.email;
        const [allowedUser] = await connection.execute<RowDataPacket[]>('SELECT ID FROM User WHERE Email = ?', [userEmail]);
        if (allowedUser.length===0){
            return NextResponse.json({error: "Access Denied"}, {status: 403});
        }

        const [rows] = await connection.execute("SELECT ID, AccountName FROM Account ORDER BY AccountName ASC");
        return NextResponse.json(rows);
    }
    // If there is an error in the try block, the JSON response sense includes the error message and status code (500 indicates a general server error)
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to fetch chart of accounts."}, {status: 500});
    }
};
/*
export async function POST(req: Request) {
    try {
        const {text} = await req.json();

        const [entryResult] = await connection.execute<ResultSetHeader>(
            "INSERT INTO Account (text) VALUES (?)",
            [text]
        );
    }
}
export async function PATCH(req: Request) {
    
}
export async function DELETE(req: Request) {
    
}
*/