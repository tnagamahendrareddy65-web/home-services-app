import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const userEmail = params?.user;

  // If no user is registered/logged in, redirect them to sign up first
  if (!userEmail) {
    redirect("/register");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  let services = [];
  try {
    services = await prisma.service.findMany({
      include: { category: true },
    });
  } catch (error) {
    console.error("Database connection error on Home page:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }

  async function handleBookService(formData) {
    "use server";
    const serviceId = formData.get("serviceId");
    const date = formData.get("date");
    const name = formData.get("name");
    const email = formData.get("email");

    if (!serviceId || !date) return;

    const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
    const dbAdapter = new PrismaPg(dbPool);
    const db = new PrismaClient({ adapter: dbAdapter });
    
    await db.booking.create({
      data: {
        name: name || "Registered User",
        email: email || userEmail,
        serviceId,
        date: new Date(date),
      },
    });

    await db.$disconnect();
    await dbPool.end();

    redirect(`/?user=${encodeURIComponent(userEmail)}&success=true`);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">Home Services Platform</h1>
            <p className="text-gray-600 text-sm">Welcome, <span className="font-semibold text-gray-800">{userEmail}</span></p>
          </div>
          <a
            href="/dashboard"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 transition"
          >
            View Dashboard
          </a>
        </header>

        {/* Available Services Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Services</h2>
          {services.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-red-500 font-medium">No services found in database.</p>
              <p className="text-gray-500 text-sm mt-1">Please ensure your production database is seeded.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    {service.category?.name || "General"}
                  </span>
                  <h3 className="text-xl font-bold text-gray-800 mt-1">{service.title}</h3>
                  <p className="text-lg font-medium text-green-600 mt-2">${service.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Booking Form Section */}
        <section className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Book an Appointment</h2>
          <form action={handleBookService} className="space-y-4">
            <input type="hidden" name="email" value={userEmail} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
              <select
                name="serviceId"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
              >
                <option value="">-- Choose a Service --</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title} (${service.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date & Time</label>
              <input
                type="datetime-local"
                name="date"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition"
            >
              Confirm Booking
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}