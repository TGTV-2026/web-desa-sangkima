import { NextResponse } from "next/server";
import { getAuthUser, type AuthUser } from "./role.middleware";

export type AllowedRole = "user" | "staff" | "admin";

export interface ACLConfig {
  allowedRoles: AllowedRole[];
}

/**
 * ACL Middleware untuk mengecek role akses
 * Throw error jika role tidak authorized
 */
export async function requireRole(
  req: Request,
  allowedRoles: AllowedRole[],
): Promise<AuthUser> {
  const auth = await getAuthUser(req);

  if (!auth) {
    throw new ACLError("Unauthorized - token tidak valid", 401);
  }

  if (!allowedRoles.includes(auth.role)) {
    throw new ACLError(
      `Hanya ${allowedRoles.join(", ")} yang boleh mengakses resource ini`,
      403,
    );
  }

  return auth;
}

/**
 * Custom Error untuk ACL
 */
export class ACLError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ACLError";
  }
}

/** Type guard untuk dipakai di `catch` route sebelum memanggil handleACLError. */
export function isACLError(error: unknown): error is ACLError {
  return error instanceof ACLError;
}

/**
 * Handler untuk menangkap ACL error
 */
export function handleACLError(error: unknown): NextResponse {
  if (error instanceof ACLError) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  throw error;
}
