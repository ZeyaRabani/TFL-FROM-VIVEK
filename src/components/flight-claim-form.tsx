"use client";

import { useRef, useState } from "react";

export function FlightClaimForm() {
  const [submitted, setSubmitted] = useState(false);
  const [evidenceName, setEvidenceName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState("");
  const [reviewMode, setReviewMode] = useState<"ai" | "demo" | null>(null);
  const [reviewError, setReviewError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function reviewClaim() {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const field = (name: string) => String(formData.get(name) ?? "").trim();
    setReviewing(true);
    setReviewError("");

    try {
      const response = await fetch("/api/flights/claim-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flightNumber: field("flightNumber"),
          travelDate: field("travelDate"),
          bookingReference: field("bookingReference"),
          departureAirport: field("departureAirport"),
          arrivalAirport: field("arrivalAirport"),
          disruption: field("disruption"),
          hasEvidence: Boolean(evidenceName),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        mode?: "ai" | "demo";
        review?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "The claim agent could not review this yet.");
      setReview(result.review ?? "Your details are ready for a final check.");
      setReviewMode(result.mode ?? "demo");
    } catch (cause) {
      setReviewError(cause instanceof Error ? cause.message : "The claim agent could not review this yet.");
    } finally {
      setReviewing(false);
    }
  }

  if (submitted) {
    return (
      <section className="border border-sky-200 bg-sky-50 p-6 sm:p-8" aria-live="polite">
        <p className="mono text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">Prototype complete</p>
        <h2 className="display mt-3 text-3xl font-bold uppercase tracking-wide text-ink">Evidence received</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {message} Nothing has been sent to British Airways or stored as a claim yet.
        </p>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      className="border border-line bg-paper p-5 shadow-[var(--shadow)] sm:p-7"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
          const response = await fetch("/api/flights/evidence", {
            method: "POST",
            body: new FormData(event.currentTarget),
          });
          const result = (await response.json()) as { error?: string; message?: string };
          if (!response.ok) throw new Error(result.error ?? "Could not process the evidence.");
          setMessage(result.message ?? "Evidence check complete.");
          setSubmitted(true);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not process the evidence.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">New flight claim</p>
          <h2 className="display mt-1 text-2xl font-bold uppercase tracking-wide text-ink">British Airways</h2>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 mono text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-800">Prototype</span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="form-field">
          <span>Flight number</span>
          <input className="board-input" name="flightNumber" placeholder="BA 123" required />
        </label>
        <label className="form-field">
          <span>Travel date</span>
          <input className="board-input" name="travelDate" type="date" required />
        </label>
        <label className="form-field sm:col-span-2">
          <span>Booking reference</span>
          <input className="board-input" name="bookingReference" placeholder="e.g. ABC123" required />
        </label>
        <label className="form-field">
          <span>Departure airport</span>
          <input className="board-input" name="departureAirport" placeholder="e.g. London Heathrow" required />
        </label>
        <label className="form-field">
          <span>Arrival airport</span>
          <input className="board-input" name="arrivalAirport" placeholder="e.g. Barcelona" required />
        </label>
        <label className="form-field sm:col-span-2">
          <span>What happened?</span>
          <select className="board-input" name="disruption" defaultValue="" required>
            <option value="" disabled>Select a disruption</option>
            <option>Delayed arrival</option>
            <option>Cancelled flight</option>
            <option>Denied boarding</option>
          </select>
        </label>
      </div>

      <label className="evidence-upload mt-5" htmlFor="booking-evidence">
        <span className="evidence-icon" aria-hidden>↑</span>
        <span className="evidence-copy">
          <strong>Upload booking evidence</strong>
          <small>Required · PDF, JPG, or PNG · booking confirmation, e-ticket, or boarding pass</small>
        </span>
        <span className="evidence-file-cta">Choose file</span>
        <input
          id="booking-evidence"
          name="bookingEvidence"
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          required
          onChange={(event) => setEvidenceName(event.target.files?.[0]?.name ?? "")}
        />
      </label>
      <p className="evidence-file-name" aria-live="polite">
        {evidenceName ? `Selected: ${evidenceName}` : "No file selected yet"}
      </p>

      <section className="claim-agent mt-5" aria-labelledby="claim-agent-title">
        <div className="claim-agent-mark" aria-hidden>✦</div>
        <div className="min-w-0 flex-1">
          <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-700">Gimme Claim Agent</p>
          <h3 id="claim-agent-title" className="display mt-1 text-lg font-bold uppercase tracking-wide text-ink">Quick claim check</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
            Checks whether your flight details and booking evidence look ready before you continue.
          </p>
          <p className="mt-2 mono text-[10px] uppercase tracking-[0.08em] text-ink-muted">
            Does not determine eligibility or submit a claim.
          </p>
        </div>
        <button
          type="button"
          className="board-btn board-btn-ghost mono claim-agent-button text-[10px] uppercase tracking-[0.12em]"
          onClick={reviewClaim}
          disabled={reviewing}
        >
          {reviewing ? "Reviewing…" : "Review details"}
        </button>
        {review ? (
          <p className="claim-agent-result" aria-live="polite">
            <strong>{reviewMode === "ai" ? "Agent review" : "Demo review"}</strong>
            {review}
          </p>
        ) : null}
        {reviewError ? <p className="mono claim-agent-error" role="alert">{reviewError}</p> : null}
      </section>

      <button type="submit" className="board-btn board-btn-primary mono mt-5 w-full py-3 text-xs uppercase tracking-[0.16em]">
        {submitting ? "Checking evidence…" : "Add flight evidence"}
      </button>
      {error ? <p className="mono mt-3 text-xs text-rail" role="alert">{error}</p> : null}
    </form>
  );
}
