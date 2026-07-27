import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Initialize Prisma directly inside the route to avoid module resolution errors
const connectionString = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email, name, password },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Auth API is running" });
}
// force refresh
