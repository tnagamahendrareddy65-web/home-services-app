import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  async function handleRegister(formData) {
    "use server";
    const name = formData.get("name");
    const email = formData.get("email");

    if (!name || !email) return;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    // For simplicity, save or check user, and store session in cookies or redirect
    // Here we redirect to the homepage with a query param representing the logged-in user email
    await prisma.$disconnect();
    await pool.end();

    redirect(`/?user=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 mb-2 text-center">Welcome to Home Services</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">Please register your account to continue.</p>
        
        <form action={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
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
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Register & Continue
          </button>
        </form>
      </div>
    </main>
  );
}