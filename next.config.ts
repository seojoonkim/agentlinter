import type { NextConfig } from "next";
import { readFileSync } from "fs";
import { resolve } from "path";

const cliPkg = JSON.parse(
  readFileSync(resolve(__dirname, "packages/cli/package.json"), "utf-8")
);

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CLI_VERSION: cliPkg.version,
  },
};

export default nextConfig;
