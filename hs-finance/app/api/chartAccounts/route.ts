// This file is a server component (note there is no "use client")
// route.ts is used for an API endpoint with a URL of /api/competencies

import { NextResponse } from "next/server";
import connection from "@/lib/db";

// A GET request is an HTTP method to retrieve some data from a server based on a request
// App Router automatically looks for exported functions based on HTTP methods such as GET
export async function GET() {
    // We try to execute a query on our database to select all of the competencies sorted by the skill name
    // The resulting rows are sent as JSON
    try {
        const [rows] = await connection.execute("SELECT ID, AccountName FROM Account ORDER BY AccountName ASC");
        return NextResponse.json(rows);
    }
    // If there is an error in the try block, the JSON response sense includes the error message and status code (500 indicates a general server error)
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to fetch chart of accounts."}, {status: 500});
    }
} 
export async function POST(req: Request) {
    
}