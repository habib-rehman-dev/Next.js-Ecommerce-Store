import { dbConnect } from "@/lib/db/dbConnect";

// TEMPORARY — hit http://localhost:3000/api/test-db once, confirm "connected",
// then delete this file. It has no auth guard and shouldn't ship.
export async function GET() {
  const mongoose = await dbConnect();
  return Response.json({
    status: "connected",
    readyState: mongoose.connection.readyState, // 1 === connected
    dbName: mongoose.connection.db?.databaseName,
  });
}