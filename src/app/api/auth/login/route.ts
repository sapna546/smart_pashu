import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../../../models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Error in login API:", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}