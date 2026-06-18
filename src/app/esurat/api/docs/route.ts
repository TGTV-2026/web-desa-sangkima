import { swaggerSpec } from "@/lib/swagger";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: API Documentation (OpenAPI Specification)
 *     description: Returns the OpenAPI/Swagger specification for the API
 *     tags:
 *       - Documentation
 *     responses:
 *       200:
 *         description: OpenAPI specification JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
