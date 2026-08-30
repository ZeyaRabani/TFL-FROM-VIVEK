import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "playwright",
    "pg",
    "@prisma/adapter-pg",
    "@daytona/sdk",
  ],
};

export default withWorkflow(nextConfig);
