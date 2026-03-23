import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "../../../../models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 409 }
      );
    }

    const hashedPass = await bcrypt.hash(password, 12);

    const newUser = await User.create({ name, email, password: hashedPass });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error("Error in signup API:", error);
    return NextResponse.json(
      { message: "Internal Server Error." },
      { status: 500 }
    );
  }
}