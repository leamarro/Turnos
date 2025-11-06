import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.service.createMany({
    data: [
      {
        name: "Maquillaje",
        duration: 60, // duración en minutos
        price: 20000,
      },
      {
        name: "Perfilado de cejas",
        duration: 30,
        price: 10000,
      }
    ],
  });

  console.log("✅ Servicios cargados correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
