const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function randomPrice(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

async function main() {
  const services = [
    {
      name: "Perfilado",
      duration: 30,
      price: randomPrice(5000, 9000),
      color: "#E8A87C",
    },
    {
      name: "Maquillaje",
      duration: 60,
      price: randomPrice(8000, 15000),
      color: "#D495A7",
    },
    {
      name: "Prueba maquillaje",
      duration: 45,
      price: randomPrice(6000, 12000),
      color: "#9FB4C7",
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  console.log("✅ Servicios creados correctamente");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
