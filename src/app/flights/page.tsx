import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { FlightClaimForm } from "@/components/flight-claim-form";

export default function FlightsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
        <Link href="/" className="mono text-[10px] uppercase tracking-[0.18em] text-rail hover:underline">
          ← Travel options
        </Link>
        <div className="mt-5 grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:gap-12">
          <section>
            <p className="mono text-[10px] uppercase tracking-[0.22em] text-rail">Flight delay compensation</p>
            <h1 className="display mt-2 text-5xl font-bold uppercase leading-[0.9] tracking-[0.04em] text-ink sm:text-6xl">
              Your BA flight, claimed.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              Tell us about a delayed British Airways flight and add your booking evidence. We&apos;ll use this flow for claim preparation next.
            </p>
            <div className="mt-7 border border-sky-200 bg-sky-50 p-5">
              <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">Evidence required</p>
              <p className="mt-2 text-sm leading-relaxed text-sky-950">
                Upload a booking confirmation, e-ticket, or boarding pass that shows your name, flight number, and travel date.
              </p>
            </div>
          </section>
          <FlightClaimForm />
        </div>
      </main>
    </div>
  );
}
