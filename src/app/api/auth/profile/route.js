import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Profile API working" },
    { status: 200 }
  );
}