<div className="grid grid-cols-7 gap-2 sm:gap-4 mt-4">
  {days.map((day, index) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateKey = date.toISOString().split("T")[0];
    const isToday = date.toDateString() === today.toDateString();
    const dayAppointments = appointments.filter(a => a.date.startsWith(dateKey));

    return (
<div className="flex justify-between items-center mb-4">
  <button onClick={handlePrevMonth} className="text-[var(--color-text)] text-xl font-light">
    ←
  </button>
  <h2 className="text-lg font-semibold">
    {monthName} {year}
  </h2>
  <button onClick={handleNextMonth} className="text-[var(--color-text)] text-xl font-light">
    →
  </button>
</div>

    );
  })}
</div>
