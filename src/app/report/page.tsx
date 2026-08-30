import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ReportWizard } from "@/components/report-wizard";

export default function ReportPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <p className="mono mb-1 text-[10px] uppercase tracking-[0.22em] text-ink-muted">
          Report
        </p>
        <h1 className="display mb-8 text-4xl font-bold uppercase tracking-wide text-ink sm:text-5xl">
          I was on a delayed train
        </h1>
        <aside className="mb-8 flex flex-col gap-4 border border-sky-200 bg-sky-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              Contactless traveller?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-sky-950">
              Link your TfL Contactless &amp; Oyster account to demonstrate the
              automated journey-proof flow in this prototype.
            </p>
          </div>
          <Link
            href="/settings"
            className="board-btn board-btn-primary mono shrink-0 px-4 py-2.5 text-center text-xs uppercase tracking-[0.14em]"
          >
            Link TfL account
          </Link>
        </aside>
        <ReportWizard />
      </main>
    </div>
  );
}
