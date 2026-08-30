import { Daytona } from "@daytona/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EVIDENCE_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_") || "booking-evidence";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const evidence = formData.get("bookingEvidence");

  if (!(evidence instanceof File)) {
    return NextResponse.json({ error: "Booking evidence is required." }, { status: 400 });
  }

  if (!ALLOWED_EVIDENCE_TYPES.has(evidence.type) || evidence.size > MAX_EVIDENCE_BYTES) {
    return NextResponse.json(
      { error: "Use a PDF, JPG, or PNG file no larger than 10 MB." },
      { status: 400 },
    );
  }

  if (!process.env.DAYTONA_API_KEY) {
    return NextResponse.json({
      mode: "prototype",
      message: "Daytona is not configured yet, so this evidence was not sent anywhere.",
    });
  }

  const daytona = new Daytona({
    apiKey: process.env.DAYTONA_API_KEY,
    target: process.env.DAYTONA_TARGET,
  });
  try {
    const sandbox = await daytona.create({
      language: "typescript",
      ephemeral: true,
      autoDeleteInterval: 0,
      networkBlockAll: true,
      labels: { app: "gimme", task: "flight-evidence-check" },
    });

    try {
      const destination = `/tmp/${safeFileName(evidence.name)}`;
      await sandbox.fs.uploadFile(Buffer.from(await evidence.arrayBuffer()), destination);
      const check = await sandbox.process.executeCommand(
        `test -s ${JSON.stringify(destination)} && echo "evidence-received"`,
        undefined,
        undefined,
        30,
      );

      if (check.exitCode !== 0) {
        throw new Error("Daytona could not verify the uploaded evidence.");
      }

      return NextResponse.json({
        mode: "daytona",
        message: "Evidence was checked in an isolated Daytona sandbox and deleted afterwards.",
      });
    } finally {
      await daytona.delete(sandbox).catch(() => undefined);
    }
  } catch {
    return NextResponse.json(
      { error: "Daytona could not authenticate. Check that DAYTONA_API_KEY is a current API key." },
      { status: 502 },
    );
  }
}
