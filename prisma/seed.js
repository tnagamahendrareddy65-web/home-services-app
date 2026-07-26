require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");
  
  // Clear existing data to avoid duplicates
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories
  const cleaning = await prisma.category.create({
    data: { name: "Cleaning", slug: "cleaning" },
  });

  const plumbing = await prisma.category.create({
    data: { name: "Plumbing", slug: "plumbing" },
  });

  const repair = await prisma.category.create({
    data: { name: "Repair & Maintenance", slug: "repair" },
  });

  // Create Services
  await prisma.service.createMany({
    data: [
      {
        title: "Deep House Cleaning",
        price: 99.99,
        categoryId: cleaning.id,
      },
      {
        title: "Kitchen & Bathroom Sanitization",
        price: 59.99,
        categoryId: cleaning.id,
      },
      {
        title: "Leaky Faucet Repair",
        price: 45.00,
        categoryId: plumbing.id,
      },
      {
        title: "Pipe Leak Detection & Fixing",
        price: 120.00,
        categoryId: plumbing.id,
      },
      {
        title: "AC Servicing & Gas Refill",
        price: 85.00,
        categoryId: repair.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });