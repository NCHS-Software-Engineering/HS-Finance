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
        const accountID = searchParams.get("accountID");
        const type = searchParams.get("type");
        const rec = searchParams.get("rec");
        const voided = searchParams.get("void");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const direction = searchParams.get("direction");
        const register = searchParams.get("register");
        const location = searchParams.get("location");
        const classID = searchParams.get("classID");

        let query =
        `SELECT
            Entry.ID, Entry.TransactionID, Entry.AccountID, Entry.Location, Entry.Memo, Entry.Date, Entry.RegisterID, Entry.Void, Entry.Rec, Entry.EntryType, Entry.ClassID
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
            query += ` AND Entry.Void = ?`;
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
        if (classID) {
            query += ` AND Entry.ClassID = ?`;
            params.push(classID);
        }
        if (accountID) {
            query += ` AND Entry.AccountID = ?`;
            params.push(accountID);
        }
        if (location) {
            query += ` AND Entry.Location LIKE ?`;
            params.push(`%${location}%`);
        }

        query += ` ORDER BY Entry.ID ASC`;

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
        
        const schema = z.object({
            TransactionID: z.number(),
            Location: z.string(),
            AccountID: z.number(),
            Memo: z.string(),
            Date: z.string(),
            RegisterID: z.number(),
            Void: z.number(),
            Rec: z.number(),
            EntryType: z.string(),
            ClassID: z.number()
        });

        const data = schema.parse(await request.json());

        const {
            TransactionID,
            Location,
            AccountID,
            Memo,
            Date,
            RegisterID,
            Void,
            Rec,
            EntryType,
            ClassID
        } = data;
        
        const [registers] = await connection.execute<RowDataPacket[]>(
            `SELECT Register.ID, Register.SchoolID, User.SchoolID, User.Email, User.AccountType FROM Register, User 
            WHERE User.Email = ? AND User.SchoolID = Register.SchoolID AND (Register.ID = ? OR User.AccountType = "Dev") `,
            [session.user.email, RegisterID]
        );
        if (registers.length === 0){
            return NextResponse.json({error: "Access Denied"}, {status: 403});
        }

        const [entryResult] = await connection.execute<ResultSetHeader>(
            "INSERT INTO Entry (TransactionID, Location, AccountID, Memo, Date, RegisterID, Void, Rec, EntryType, ClassID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [TransactionID, Location, AccountID, Memo, Date, RegisterID, Void, Rec, EntryType, ClassID]
        );
        const entryID = entryResult.insertId;
        return NextResponse.json({ success: true, entryID });

    }
    catch (err) {
        console.log(err);
        if (err instanceof z.ZodError) {
            return NextResponse.json({
                error: "Invalid entry data",
                details: err.flatten(),
            }, { status: 400 });
        }
        return NextResponse.json({error: "Failed to add entry"}, {status: 500});
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
        }

        const singleUpdateSchema = z.object({
            EntryID: z.number(),
            Rec: z.boolean(),
        });
        const bulkUpdateSchema = z.object({
            updates: z.array(singleUpdateSchema).min(1),
        });

        const payload = await request.json();
        const updates = "updates" in payload
            ? bulkUpdateSchema.parse(payload).updates
            : [singleUpdateSchema.parse(payload)];

        // Keep only the latest value per entry ID if duplicates are submitted.
        const updatesByEntry = new Map<number, boolean>();
        updates.forEach(update => {
            updatesByEntry.set(update.EntryID, update.Rec);
        });
        const uniqueUpdates = Array.from(updatesByEntry.entries()).map(([EntryID, Rec]) => ({ EntryID, Rec }));
        const entryIDs = uniqueUpdates.map(update => update.EntryID);

        const placeholders = entryIDs.map(() => "?").join(", ");

        const [allowedRows] = await connection.execute<RowDataPacket[]>(
            `SELECT Entry.ID
             FROM Entry
             JOIN Register ON Register.ID = Entry.RegisterID
             JOIN User ON (User.SchoolID = Register.SchoolID OR User.AccountType = 'Dev')
             WHERE User.Email = ? AND Entry.ID IN (${placeholders})`,
            [session.user.email, ...entryIDs]
        );

        if (allowedRows.length !== entryIDs.length) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        for (const update of uniqueUpdates) {
            await connection.execute<ResultSetHeader>(
                "UPDATE Entry SET Rec = ? WHERE ID = ?",
                [update.Rec ? 1 : 0, update.EntryID]
            );
        }

        return NextResponse.json({ success: true, updates: uniqueUpdates });
    }
    catch (err) {
        console.log(err);
        return NextResponse.json({ error: "Failed to update reconciliation." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
        }

        const fundSchema = z.object({
            ID: z.number().optional(),
            Target: z.string(),
            Description: z.string(),
            PaymentMethod: z.string(),
            ReferenceNumber: z.number(),
            Amount: z.number(),
        });

        const schema = z.object({
            EntryID: z.number(),
            TransactionID: z.number(),
            Location: z.string(),
            AccountID: z.number(),
            Memo: z.string(),
            Date: z.string(),
            Void: z.number(),
            EntryType: z.string(),
            ClassID: z.number(),
            funds: z.array(fundSchema),
        });

        const data = schema.parse(await request.json());

        // Verify entry access
        const [allowedEntries] = await connection.execute<RowDataPacket[]>(
            `SELECT Entry.ID
             FROM Entry
             JOIN Register ON Register.ID = Entry.RegisterID
             JOIN User ON (User.SchoolID = Register.SchoolID OR User.AccountType = 'Dev')
             WHERE User.Email = ? AND Entry.ID = ?`,
            [session.user.email, data.EntryID]
        );

        if (allowedEntries.length === 0) {
            return NextResponse.json({ error: "Access Denied" }, { status: 403 });
        }

        // Update entry
        await connection.execute<ResultSetHeader>(
            `UPDATE Entry SET TransactionID = ?, Location = ?, AccountID = ?, Memo = ?, Date = ?, Void = ?, EntryType = ?, ClassID = ?
             WHERE ID = ?`,
            [data.TransactionID, data.Location, data.AccountID, data.Memo, data.Date, data.Void, data.EntryType, data.ClassID, data.EntryID]
        );

        // Delete existing funds for this entry
        await connection.execute<ResultSetHeader>(
            "DELETE FROM Fund WHERE EntryID = ?",
            [data.EntryID]
        );

        // Insert new funds
        for (const fund of data.funds) {
            try {
                await connection.execute<ResultSetHeader>(
                    `INSERT INTO Fund (EntryID, Target, Description, PaymentMethod, ReferenceNumber, Amount)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [data.EntryID, fund.Target, fund.Description, fund.PaymentMethod, fund.ReferenceNumber, fund.Amount]
                );
            } catch (fundErr) {
                console.error("Fund insert error:", fundErr);
                throw fundErr;
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("PUT endpoint error:", err);
        return NextResponse.json({ error: "Failed to update entry", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try{
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({error: "Not Authenticated"}, {status: 401});
        }

        const schema = z.object({
            EntryID: z.number()
        });

        const data = schema.parse(await request.json());

        const {
            EntryID
        } = data;

        const [registers] = await connection.execute<RowDataPacket[]>(
            `SELECT Register.ID, Register.SchoolID, User.SchoolID, User.Email, Entry.ID, Entry.RegisterID FROM Register, User, Entry
            WHERE User.Email = ? AND User.SchoolID = Register.SchoolID AND (Entry.RegisterID = Register.ID OR User.AccountType = "Dev") AND Entry.ID = ?`,
            [session.user.email, EntryID]
        );
        if (registers.length === 0){
            return NextResponse.json({error: "Access Denied"}, {status: 403});
        }

        const [fundResult] = await connection.execute<ResultSetHeader>(
            "DELETE FROM Fund WHERE Fund.EntryID = ?",
            [EntryID]
        );
        const [entryResult] = await connection.execute<ResultSetHeader>(
            "DELETE FROM Entry WHERE Entry.ID = ?",
            [EntryID]
        );
        return NextResponse.json({ success: true, entryResult });

    }
    catch (err) {
        console.log(err);
        return NextResponse.json({error: "Failed to delete entry"}, {status: 500});
    }
}