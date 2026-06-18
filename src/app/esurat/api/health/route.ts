import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health Check / Database Connection Test
 *     description: Test if the API and database connection are working properly
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function GET() {
  try {
    // Test connection by querying users table
    const userCount = await db.select().from(users).limit(1);

    return NextResponse.json(
      {
        status: "ok",
        message: "Database connection successful",
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
