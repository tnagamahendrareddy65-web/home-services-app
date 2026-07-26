import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.password !== password) {
        return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 400 });
      }
    } else {
      if (!name) {
        return NextResponse.json({ error: "Name is required for new accounts." }, { status: 400 });
      }
      await prisma.user.create({
        data: { name, email, password },
      });
    }

    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error("API AUTH ERROR:", err);
    return NextResponse.json({ error: err.message || "Database error occurred." }, { status: 500 });
  } finally {
    await prisma.();
  }
}
