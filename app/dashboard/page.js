import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const userEmail = params?.user || "";

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  let bookings = [];
  try {
    bookings = await prisma.booking.findMany({
      include: { service: true },
      orderBy: { date: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">User Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage your service bookings and appointments.</p>
          </div>
          <a
            href={`/?user=${encodeURIComponent(userEmail)}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </a>
        </header>

        <section className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center p-8">No bookings found yet. Go book a service!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 text-sm">
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Service</th>
                    <th className="p-4">Appointment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-800 text-sm">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium">{booking.name}</td>
                      <td className="p-4 text-gray-600">{booking.email}</td>
                      <td className="p-4 font-semibold text-blue-600">
                        {booking.service?.title || "Unknown Service"}
                      </td>
                      <td className="p-4 text-gray-600">
                        {new Date(booking.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}