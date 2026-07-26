import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams?.error;

  async function handleAuth(formData) {
    "use server";
    const name = formData.get("name") || "";
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      redirect("/register?error=Email+and+password+are+required.");
    }

    const prisma = new PrismaClient();

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        if (existingUser.password !== password) {
          redirect("/register?error=Incorrect+password.+Please+try+again.");
        }
      } else {
        if (!name) {
          redirect("/register?error=Name+is+required+for+new+accounts.");
        }
        await prisma.user.create({
          data: { name, email, password },
        });
      }
    } catch (err) {
      if (err.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      console.error("DB_ERROR_DETAIL:", err);
      redirect(`/register?error=${encodeURIComponent(err.code ? `DB Error (${err.code}): ${err.message}` : err.message)}`);
    } finally {
      await prisma.$disconnect();
    }

    redirect(`/?user=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 mb-2 text-center">Home Services Platform</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Enter your details. If you already have an account, you will be logged in; otherwise, a new account will be created.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium break-words">
            {decodeURIComponent(errorMsg)}
          </div>
        )}

        <form action={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (For New Accounts)</label>
            <input
              type="text"
              name="name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Continue to Platform
          </button>
        </form>
      </div>
    </main>
  );
}