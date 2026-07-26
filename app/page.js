import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export default async function Home() {
  let services = [];
  try {
    services = await prisma.service.findMany({
      include: { category: true },
    });
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  async function handleBookService(formData) {
    "use server";
    const name = formData.get("name");
    const email = formData.get("email");
    const serviceId = formData.get("serviceId");
    const date = formData.get("date");

    if (!name || !email || !serviceId || !date) return;

    const db = new PrismaClient();
    await db.booking.create({
      data: {
        name,
        email,
        serviceId,
        date: new Date(date),
      },
    });

    redirect("/?success=true");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Home Services Platform</h1>
          <p className="text-gray-600">Reliable home cleaning, plumbing, and repair services at your doorstep.</p>
        </header>

        {/* Available Services Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Services</h2>
          {services.length === 0 ? (
            <p className="text-gray-500 text-center bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              Loading services or database needs seeding...
            </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black"
                placeholder="john@example.com"
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