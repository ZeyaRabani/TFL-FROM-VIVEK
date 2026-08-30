import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const claimSchema = z.object({
  flightNumber: z.string().trim().max(32),
  travelDate: z.string().trim().max(32),
  bookingReference: z.string().trim().max(64),
  departureAirport: z.string().trim().max(100),
  arrivalAirport: z.string().trim().max(100),
  disruption: z.string().trim().max(100),
  hasEvidence: z.boolean(),
});

type ClaimDetails = z.infer<typeof claimSchema>;

function missingFields(details: ClaimDetails) {
  return [
    [details.flightNumber, "a flight number"],
    [details.travelDate, "a travel date"],
    [details.bookingReference, "a booking reference"],
    [details.departureAirport, "a departure airport"],
    [details.arrivalAirport, "an arrival airport"],
    [details.disruption, "a disruption type"],
    [details.hasEvidence, "booking evidence"],
  ]
    .filter(([value]) => !value)
    .map(([, label]) => label);
}

function demoReview(details: ClaimDetails) {
  const missing = missingFields(details);
  if (missing.length) {
    return `Before continuing, add ${missing.join(", ")}. The agent can then check whether the claim information looks complete.`;
  }

  return "Your flight number, journey details, disruption type, booking reference, and evidence selection are all present. Keep the original booking confirmation and any delay or cancellation notice for a later claim-preparation step.";
}

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the claim details as JSON." }, { status: 400 });
  }

  const parsed = claimSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: "Some claim details are invalid." }, { status: 400 });
  }

  const details = parsed.data;
  const missing = missingFields(details);
  if (!process.env.OPENAI_API_KEY || missing.length) {
    return NextResponse.json({ mode: "demo", review: demoReview(details) });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      store: false,
      max_output_tokens: 220,
      instructions:
        "You are Gimme Claim Agent. Give a concise, helpful readiness review for a British Airways flight-claim form. Do not decide legal eligibility, promise compensation, or say that a claim was submitted. Do not ask for or infer sensitive personal data. Mention that the booking document itself was not reviewed. Write one short paragraph in plain English.",
      input: JSON.stringify({
        flightNumber: details.flightNumber,
        travelDate: details.travelDate,
        departureAirport: details.departureAirport,
        arrivalAirport: details.arrivalAirport,
        disruption: details.disruption,
        hasBookingReference: Boolean(details.bookingReference),
        hasEvidenceFile: details.hasEvidence,
      }),
    });

    return NextResponse.json({
      mode: "ai",
      review: response.output_text || demoReview(details),
    });
  } catch {
    return NextResponse.json({
      mode: "demo",
      review: `${demoReview(details)} AI review is temporarily unavailable, so this is the local readiness check.`,
    });
  }
}
