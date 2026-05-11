"use client";

export const dynamic = "force-dynamic";
import AppointmentForm from "@/components/AppointmentForm";


export default function AppointmentPage() {
  return (
    <div className="min-h-screen bg-[#f6f1ea] px-4 py-10 sm:px-6 lg:px-8">
      <AppointmentForm />
    </div>
  );
}
