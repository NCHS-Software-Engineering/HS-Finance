import mysql from "mysql2/promise";

// createPool is an async function that returns a Promise (placeholder for the value that will eventually be returned), so we can use await here  
// A connection pool is a collection of reusable database connections so a new connection doesn't have to be created every time
// You should almost always be using createPool to create your database connections
const connection = await mysql.createPool({
    // The values for the database connection will come from the .env.local file
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB,
});

// The connection variable can be used in any file that imports db.ts
export default connection;