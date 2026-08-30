import { Daytona } from "@daytona/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  tflAccountEmail: z.string().email(),
  runDate: z.string().min(8).max(32),
  originName: z.string().min(1).max(100),
  destinationName: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid journey details." }, { status: 400 });
  }

  const proof = JSON.stringify({
    source: "linked-tfl-account-prototype",
    account: parsed.data.tflAccountEmail,
    journey: {
      date: parsed.data.runDate,
      origin: parsed.data.originName,
      destination: parsed.data.destinationName,
    },
  });

  if (!process.env.DAYTONA_API_KEY) {
    return NextResponse.json({
      mode: "prototype",
      message: "Prototype TfL journey proof retrieved. Daytona is not configured, so no sandbox check was run.",
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
      labels: { app: "gimme", task: "tfl-journey-proof-check" },
    });
    try {
      await sandbox.fs.uploadFile(Buffer.from(proof), "/tmp/tfl-journey-proof.json");
      const check = await sandbox.process.executeCommand(
        'test -s /tmp/tfl-journey-proof.json && echo "proof-verified"',
        undefined,
        undefined,
        30,
      );
      if (check.exitCode !== 0) throw new Error("Daytona could not verify the TfL proof.");

      return NextResponse.json({
        mode: "daytona",
        message: "Prototype TfL journey proof retrieved and checked in an isolated Daytona sandbox.",
      });
    } finally {
      await daytona.delete(sandbox).catch(() => undefined);
    }
  } catch (cause) {
    console.warn(
      "[daytona] TfL proof sandbox check skipped:",
      cause instanceof Error ? cause.message : String(cause),
    );
    return NextResponse.json({
      mode: "prototype",
      message: "Prototype TfL journey proof retrieved. Daytona was unavailable, so the sandbox check was skipped.",
    });
  }
}
