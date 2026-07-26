import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") || "";
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return NextResponse.redirect(new URL("/register?error=Email+and+password+are+required.", request.url), { status: 303 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.password !== password) {
        return NextResponse.redirect(new URL("/register?error=Incorrect+password.+Please+try+again.", request.url), { status: 303 });
      }
    } else {
      if (!name) {
        return NextResponse.redirect(new URL("/register?error=Name+is+required+for+new+accounts.", request.url), { status: 303 });
      }
      await prisma.user.create({
        data: { name, email, password },
      });
    }

    return NextResponse.redirect(new URL(/?user=, request.url), { status: 303 });
  } catch (err) {
    console.error("API AUTH ERROR:", err);
    return NextResponse.redirect(new URL(/register?error=, request.url), { status: 303 });
  } finally {
    await prisma.();
  }
}
