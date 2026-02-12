import { NextResponse } from "next/server";
import connection from "@/app/lib/db";

export async function GET() {
    // We try to execute a query on our database to select all of the competencies sorted by the skill name
    // The resulting rows are sent as JSON
    try {
        const [rows] = await connection.execute("SELECT id, skill, description FROM Competency ORDER BY skill ASC");
        return NextResponse.json(rows);
    }
    // If there is an error in the try block, the JSON response sense includes the error message and status code (500 indicates a general server error)
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to fetch competencies."}, {status: 500});
    }
} 