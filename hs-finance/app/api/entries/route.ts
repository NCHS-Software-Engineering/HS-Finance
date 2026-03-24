// This file is a server component (note there is no "use client")
// route.ts is used for an API endpoint with a URL of /api/competencies

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";

// A GET request is an HTTP method to retrieve some data from a server based on a request
// App Router automatically looks for exported functions based on HTTP methods such as GET
export async function GET(request: Request) {
    // We try to execute a query on our database to select all of the competencies sorted by the skill name
    // The resulting rows are sent as JSON
    try {
        // Get the session information and check that the session is valid with a user email
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({error: "Not Authenticated"}, {status: 401});
        }

        const { searchParams } = new URL(request.url);

        const type = searchParams.get("type");
        const rec = searchParams.get("rec");
        const voided = searchParams.get("void");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const direction = searchParams.get("direction");
        const register = searchParams.get("register");
        const location = searchParams.get("location");

        let query = 
        `SELECT 
            Entry.ID, Entry.TransactionID, Entry.Location, Entry.Memo, Entry.Date, Entry.RegisterID, Entry.Void, Entry.Rec, Entry.EntryType
            FROM Entry
            JOIN Register ON Register.ID = Entry.RegisterID
            JOIN User ON (User.SchoolID = Register.SchoolID OR User.AccountType = 'Dev')
            JOIN Transaction ON Entry.TransactionID = Transaction.ID
            WHERE User.Email = ? 
            AND (User.SchoolID = Register.SchoolID OR User.AccountType = 'Dev')
            AND Register.ID = Entry.RegisterID`;
        const userEmail = session.user.email;
        let params = [userEmail];

        if (type) {
            query += ` AND Entry.EntryType = ?`;
            params.push(type);
        }
        if (rec !== null) {
            query += ` AND Entry.Rec = ?`;
            params.push(rec === "true" ? "1" : "0");
        }
        if (voided !== null) {
            query += ` AND Entry.Rec = ?`;
            params.push(voided === "true" ? "1" : "0");
        }

        if (startDate && endDate) {
            query += ` AND Entry.Date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ` AND Entry.Date >= ?`;
            params.push(startDate);
        } else if (endDate) {
            query += ` AND Entry.Date <= ?`;
            params.push(endDate);
        }
        
        if (direction) {
            query += ` AND Transaction.MoneyIn = ?`;
            params.push(direction);
        }
        if (register) {
            query += ` AND Entry.RegisterID = ?`;
            params.push(register);
        }

        if (location) {
            query += ` AND Entry.Location LIKE ?`;
            params.push(`%${location}%`);
        }

        query += ` ORDER BY Entry.Date DESC`;

        // Returns all if user account type is Dev, otherwise returns registers for school
        const [rows] = await connection.execute(
            query
        , params);
        return NextResponse.json(rows);
    }
    // If there is an error in the try block, the JSON response sense includes the error message and status code (500 indicates a general server error)
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to fetch chart of accounts."}, {status: 500});
    }
};

export async function POST(request: Request) {
    try{
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({error: "Not Authenticated"}, {status: 401});
        }
        const {ID, TransactionID, Location, Memo, Date, RegisterID, Void: boolean;
    Rec: boolean;
    EntryType:} = await request.json();

    }
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to add entry"}, {status: 500});
    }
}