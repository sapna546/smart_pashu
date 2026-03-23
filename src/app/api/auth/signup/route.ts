import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Signup API working" },
    { status: 200 }
  );
}