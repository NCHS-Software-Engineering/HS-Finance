// This file is a server component (note there is no "use client")
// route.ts is used for an API endpoint with a URL of /api/competencies

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { authOptions } from "@/api/auth/[...nextauth]/authOptions";
import connection from "@/lib/db";
import { z } from "zod";

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

        // Returns all if user account type is Dev, otherwise returns registers for school
        const userEmail = session.user.email;
        const [rows] = await connection.execute(
            `SELECT 
            Fund.ID, Fund.EntryID, Fund.Target, Fund.Description, Fund.PaymentMethod, Fund.ReferenceNumber, Fund.Amount, Fund.Class
            FROM Entry, User, Register, Fund
            WHERE User.Email = ? 
            AND (User.SchoolID = Register.SchoolID OR User.AccountType = 'Dev')
            AND Register.ID = Entry.RegisterID
            AND Entry.ID = Fund.EntryID
            ORDER BY Fund.ID ASC`
        , [userEmail]);
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
        
        const schema = z.object({
            EntryID: z.number(),
            Target: z.string(),
            Description: z.string(),
            PaymentMethod: z.string(),
            ReferenceNumber: z.number(),
            Amount: z.number()
        });

        const data = schema.parse(await request.json());

        const {
            EntryID,
            Target,
            Description,
            PaymentMethod,
            ReferenceNumber,
            Amount
        } = data;

        const [registers] = await connection.execute<RowDataPacket[]>(
            `SELECT Register.ID, Register.SchoolID, User.SchoolID, User.Email, Entry.ID, Entry.RegisterID FROM Register, User, Entry
            WHERE User.Email = ? AND User.SchoolID = Register.SchoolID AND Entry.RegisterID = Register.ID AND Entry.ID = ?`,
            [session.user.email, EntryID]
        );
        if (registers.length === 0){
            return NextResponse.json({error: "Access Denied"}, {status: 403});
        }

        const [entryResult] = await connection.execute<ResultSetHeader>(
            "INSERT INTO Fund (EntryID, Target, Description, PaymentMethod, ReferenceNumber, Amount) VALUES (?, ?, ?, ?, ?, ?)",
            [EntryID,
            Target,
            Description,
            PaymentMethod,
            ReferenceNumber,
            Amount]
        );
        const entryID = entryResult.insertId;
        return NextResponse.json({ success: true, entryID });

    }
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to add entry"}, {status: 500});
    }
}

export async function DEL(request: Request) {
    try{
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({error: "Not Authenticated"}, {status: 401});
        }
        
        const schema = z.object({
            ID: z.number()
        });

        const data = schema.parse(await request.json());

        const {
            ID
        } = data;

        const [registers] = await connection.execute<RowDataPacket[]>(
            `SELECT Register.ID, Register.SchoolID, User.SchoolID, User.Email, Entry.ID, Entry.RegisterID FROM Register, User, Entry
            WHERE User.Email = ? AND User.SchoolID = Register.SchoolID AND Entry.RegisterID = Register.ID AND Entry.ID = Fund.EntryID AND Fund.ID = ?`,
            [session.user.email, ID]
        );
        if (registers.length === 0){
            return NextResponse.json({error: "Access Denied"}, {status: 403});
        }

        const [fundResult] = await connection.execute<ResultSetHeader>(
            "DELETE FROM Fund WHERE Fund.EntryID = ?",
            [ID]
        );
        return NextResponse.json({ success: true, fundResult });

    }
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to add entry"}, {status: 500});
    }
}