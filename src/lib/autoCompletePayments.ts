import prisma from "@/lib/prisma";

export async function autoCompletePayments() {
  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { lt: now },
      status: { not: "cancelled" },
      servicePrice: { gt: 0 },
      payments: { none: { method: "pendiente" } },
    },
    select: {
      id: true,
      date: true,
      servicePrice: true,
      payments: { select: { amount: true } },
    },
  });

  for (const appointment of appointments) {
    const totalPaid = appointment.payments.reduce(
      (acc, p) => acc + p.amount,
      0
    );

    const remaining = (appointment.servicePrice ?? 0) - totalPaid;
    if (remaining <= 0) continue;

    await prisma.payment.create({
      data: {
        amount: remaining,
        method: "full",
        appointmentId: appointment.id,
        createdAt: appointment.date,
      },
    });
  }

  return appointments.length;
}
