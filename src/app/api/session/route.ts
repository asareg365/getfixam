import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE() {
  (await cookies()).delete("session");

  return NextResponse.json({
    success: true,
    message: "Session cleared",
  });
}