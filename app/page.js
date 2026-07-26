import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  // Fetch services and categories from your Neon database
  const services = await prisma.service.findMany({
    include: { category: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Home Services Platform</h1>
          <p className="text-gray-600">Reliable home cleaning, plumbing, and repair services at your doorstep.</p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Available Services</h2>
          {services.length === 0 ? (
            <p className="text-gray-500 text-center bg-white p-6 rounded-lg shadow-sm">
              No services found in the database yet.
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
      </div>
    </main>
  );
}