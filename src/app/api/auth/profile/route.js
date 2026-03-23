import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request) {
  // Get token from Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json(
      { message: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }
  const token = authHeader.replace("Bearer ", "").trim();

  try {
    await connectDB();
    // Verify token (assume payload is { id: user._id, ... })
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { message: "Invalid token payload", payload: decoded },
        { status: 401 }
      );
    }
    // Optionally, verify signature (uncomment if you want to check expiry and signature)
    // jwt.verify(token, process.env.AUTH_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}