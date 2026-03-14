"use client";

import DonationHistory from "@/components/donation/DonationHistory";

export default function MyDonationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/30 via-white to-violet-50/20 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <DonationHistory />
    </div>
  );
}
