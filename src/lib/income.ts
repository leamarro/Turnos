export type PaymentLike = {
  amount: number;
  createdAt?: string | Date | null;
};

export type AppointmentLike = {
  payments?: PaymentLike[] | null;
};

export function incomeInInterval(
  appointments: AppointmentLike[],
  start: Date,
  end: Date
): number {
  return appointments.reduce((sum, appointment) => {
    for (const payment of appointment.payments ?? []) {
      const date = new Date(payment.createdAt ?? Date.now());
      if (date >= start && date < end) sum += payment.amount;
    }
    return sum;
  }, 0);
}

export function paymentMonth(payment: PaymentLike): string {
  const date = new Date(payment.createdAt ?? Date.now());
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

export function incomeByMonth(
  appointments: AppointmentLike[]
): Map<string, number> {
  const map = new Map<string, number>();

  for (const appointment of appointments) {
    for (const payment of appointment.payments ?? []) {
      const month = paymentMonth(payment);
      map.set(month, (map.get(month) ?? 0) + payment.amount);
    }
  }

  return map;
}
