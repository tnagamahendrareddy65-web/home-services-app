import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString || connectionString.includes("example.com")) {
      return NextResponse.json(
        { error: "DATABASE_URL is not configured properly in Vercel. Please update it in Vercel settings." },
        { status: 500 }
      );
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });

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
  }
}
