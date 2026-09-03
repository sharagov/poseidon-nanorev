import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
  // The registrations PATCH route reads the device result CSVs from disk
  // at request time (to assign one when a test starts) — make sure the
  // serverless trace includes them.
  outputFileTracingIncludes: {
    "/api/registrations/[id]": ["./src/lib/results/files/**/*"],
  },
};

export default nextConfig;
